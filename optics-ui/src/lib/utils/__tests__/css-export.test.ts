import { describe, it, expect } from 'vitest';
import { exportOpticsCSS, type ThemeColorType } from '../css-export';
import { opticsFamilyName } from '../../data/optics-families';
import { OPTICS_FAMILY_BASELINES } from '../../data/optics-baselines';
import { OPTICS_STOPS } from '../../data/defaults';

/** A color type sitting exactly on the Optics baseline for `family`. */
function pristine(name: string, family: string): ThemeColorType {
  const baseline = OPTICS_FAMILY_BASELINES[family];
  return {
    name,
    h: baseline.h,
    s: baseline.s,
    l: baseline.l,
    lightBg: { ...baseline.lightBg },
    darkBg: { ...baseline.darkBg },
    lightOn: { ...baseline.lightOn },
    darkOn: { ...baseline.darkOn },
    lightOnAlt: { ...baseline.lightOnAlt },
    darkOnAlt: { ...baseline.darkOnAlt }
  };
}

describe('opticsFamilyName', () => {
  it('maps the four alert types under the alerts- prefix', () => {
    expect(opticsFamilyName('Notice')).toBe('alerts-notice');
    expect(opticsFamilyName('Warning')).toBe('alerts-warning');
    expect(opticsFamilyName('Danger')).toBe('alerts-danger');
    expect(opticsFamilyName('Info')).toBe('alerts-info');
  });

  it('leaves non-alert families at the top level', () => {
    expect(opticsFamilyName('Primary')).toBe('primary');
    expect(opticsFamilyName('Neutral')).toBe('neutral');
    expect(opticsFamilyName('Secondary')).toBe('secondary');
  });

  it('slugifies custom names', () => {
    expect(opticsFamilyName('Brand Accent')).toBe('brand-accent');
    expect(opticsFamilyName('  Sea Foam!  ')).toBe('sea-foam');
  });
});

describe('exportOpticsCSS', () => {
  it('emits nothing for a color type identical to Optics', () => {
    const css = exportOpticsCSS([pristine('Primary', 'primary')]);

    expect(css).not.toContain(':root');
    expect(css).toContain('Nothing to override');
  });

  it('emits only the seeds when just hue and saturation moved', () => {
    const primary = pristine('Primary', 'primary');
    primary.h = 217;
    primary.s = 91;

    const css = exportOpticsCSS([primary]);

    expect(css).toContain('--op-color-primary-h: 217;');
    expect(css).toContain('--op-color-primary-s: 91%;');
    expect(css).toContain('Scale matches the Optics defaults.');
    expect(css).not.toContain('light-dark(');
  });

  it('emits a changed stop in the same form Optics writes its own tokens', () => {
    const primary = pristine('Primary', 'primary');
    primary.lightBg.base = 42;

    const css = exportOpticsCSS([primary]);

    expect(css).toContain(
      [
        '  --op-color-primary-base: light-dark(',
        '    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 42%),',
        '    hsl(var(--op-color-primary-h) var(--op-color-primary-s) 38%)',
        '  );'
      ].join('\n')
    );
    expect(css).toContain('1 of 57 scale tokens adjusted');
  });

  it('emits the whole light-dark pair when only the dark half moved', () => {
    const primary = pristine('Primary', 'primary');
    primary.darkOn['plus-two'] = 55;

    const css = exportOpticsCSS([primary]);

    expect(css).toContain('--op-color-primary-on-plus-two: light-dark(');
    expect(css).toContain(`hsl(var(--op-color-primary-h) var(--op-color-primary-s) 16%),`);
    expect(css).toContain(`hsl(var(--op-color-primary-h) var(--op-color-primary-s) 55%)`);
  });

  it('names the alt foreground role with a trailing -alt', () => {
    const primary = pristine('Primary', 'primary');
    primary.lightOnAlt['minus-three'] = 11;

    expect(exportOpticsCSS([primary])).toContain('--op-color-primary-on-minus-three-alt: light-dark(');
  });

  it('diffs each family against its own curve, not primary\'s', () => {
    // neutral's light `plus-one` is 44% in Optics, primary's is 45%. A neutral
    // sitting on its own baseline must emit nothing for that stop.
    const neutral = pristine('Neutral', 'neutral');
    expect(exportOpticsCSS([neutral])).not.toContain('--op-color-neutral-plus-one:');

    // Cloning primary's curve onto neutral is a real difference, and shows up.
    neutral.lightBg['plus-one'] = OPTICS_FAMILY_BASELINES.primary.lightBg['plus-one'];
    expect(exportOpticsCSS([neutral])).toContain('--op-color-neutral-plus-one: light-dark(');
  });

  it('prefixes alert variables with alerts-', () => {
    const danger = pristine('Danger', 'alerts-danger');
    danger.lightBg.base = 45;

    const css = exportOpticsCSS([danger]);

    expect(css).toContain('--op-color-alerts-danger-base: light-dark(');
    expect(css).toContain('hsl(var(--op-color-alerts-danger-h) var(--op-color-alerts-danger-s) 45%)');
  });

  it('emits the full scale plus a caveat for families Optics does not define', () => {
    const secondary: ThemeColorType = { ...pristine('Secondary', 'primary'), name: 'Secondary' };

    const css = exportOpticsCSS([secondary]);

    expect(css).toContain('not an Optics color family');
    // 19 stops x 3 roles, every one emitted since there is no baseline.
    expect(css.match(/--op-color-secondary-[a-z-]+: light-dark\(/g)).toHaveLength(
      OPTICS_STOPS.length * 3
    );
  });

  it('omits unchanged families and names them in the header', () => {
    // Saturation is not aliased, so moving it leaves neutral untouched.
    const primary = pristine('Primary', 'primary');
    primary.s = 91;

    const css = exportOpticsCSS([primary, pristine('Neutral', 'neutral')]);

    expect(css).toContain('1 of 2 color types differ from Optics');
    expect(css).toContain('Unchanged, and therefore omitted: Neutral.');
    expect(css).not.toContain('--op-color-neutral-');
  });

  it('produces one :root block with balanced braces', () => {
    const primary = pristine('Primary', 'primary');
    primary.s = 91;

    const css = exportOpticsCSS([primary, { ...pristine('Secondary', 'primary'), name: 'Secondary' }]);

    expect(css.match(/:root \{/g)).toHaveLength(1);
    expect(css.match(/\{/g)).toHaveLength(1);
    expect(css.match(/\}/g)).toHaveLength(1);
  });
});

describe('exportOpticsCSS — seed lightness and -original', () => {
  it('emits --op-color-*-l when the seed lightness moved', () => {
    const primary = pristine('Primary', 'primary');
    primary.l = 60;

    const css = exportOpticsCSS([primary]);

    expect(css).toContain('--op-color-primary-l: 60%;');
  });

  it('omits --op-color-*-l when the seed lightness matches Optics', () => {
    const primary = pristine('Primary', 'primary');
    primary.h = 217;

    const css = exportOpticsCSS([primary]);

    expect(css).toContain('--op-color-primary-h: 217;');
    expect(css).not.toContain('--op-color-primary-l:');
  });

  it('declares -original for a family Optics does not define', () => {
    const secondary: ThemeColorType = { ...pristine('Secondary', 'primary'), name: 'Secondary', l: 55 };

    const css = exportOpticsCSS([secondary]);

    expect(css).toContain('--op-color-secondary-l: 55%;');
    expect(css).toContain(
      '--op-color-secondary-original: hsl(var(--op-color-secondary-h) ' +
        'var(--op-color-secondary-s) var(--op-color-secondary-l));'
    );
  });

  it('does not redeclare -original for Optics families, which derive it already', () => {
    const primary = pristine('Primary', 'primary');
    primary.l = 60;

    expect(exportOpticsCSS([primary])).not.toContain('--op-color-primary-original:');
  });
});

describe('exportOpticsCSS — aliased seeds', () => {
  it('says nothing for an aliased seed that still tracks its target', () => {
    // Optics ships `--op-color-neutral-h: var(--op-color-primary-h)`. When
    // neutral agrees with primary, stock Optics already produces that value,
    // so re-stating it would be noise.
    const primary = pristine('Primary', 'primary');
    primary.h = 217;
    primary.l = 60;
    const neutral = pristine('Neutral', 'neutral');
    neutral.h = 217;
    neutral.l = 60;

    const css = exportOpticsCSS([primary, neutral]);

    expect(css).toContain('--op-color-primary-h: 217;');
    expect(css).not.toContain('--op-color-neutral-h:');
    expect(css).not.toContain('--op-color-neutral-l:');
    expect(css).toContain('Unchanged, and therefore omitted: Neutral.');
  });

  it('pins the resolved value when primary moves and neutral does not', () => {
    // The dangerous case: leaving neutral at Optics' 216 while primary goes to
    // 217 means stock Optics would resolve neutral to 217 through the var().
    // The literal has to be written out to preserve what the builder shows.
    const primary = pristine('Primary', 'primary');
    primary.h = 217;

    const css = exportOpticsCSS([primary, pristine('Neutral', 'neutral')]);

    expect(css).toContain('--op-color-neutral-h: 216;');
  });

  it('emits a literal once the user breaks the alias', () => {
    const primary = pristine('Primary', 'primary');
    primary.h = 217;
    const neutral = pristine('Neutral', 'neutral');
    neutral.h = 190;

    const css = exportOpticsCSS([primary, neutral]);

    expect(css).toContain('--op-color-neutral-h: 190;');
    expect(css).not.toContain('--op-color-neutral-h: var(');
  });

  it('emits a literal for an aliased seed when the target is not in the export', () => {
    // Copying Neutral on its own can't reason about primary's live hue, so the
    // resolved value has to be written out.
    const neutral = pristine('Neutral', 'neutral');

    const css = exportOpticsCSS([neutral]);

    expect(css).toContain('--op-color-neutral-h: 216;');
    expect(css).toContain('--op-color-neutral-l: 48%;');
  });
});

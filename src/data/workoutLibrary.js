/**
 * workoutLibrary.js
 *
 * Curated workout library organised by track and focus.
 * The split schedule (PPL / upper-lower / full-body / daily) maps a
 * day-of-week to a focus; the hook then selects from matching workouts.
 *
 * Each workout  { id, type, track, focus, duration, exercises[] }
 * Each exercise { name, sets, reps, rest, cue }
 */

// ── Workout library ──────────────────────────────────────────────────────────

const LIBRARY = [

  // ── BODYWEIGHT — PUSH ────────────────────────────────────────────────────
  {
    id: 'bw-push-a',
    type: 'Push Day A',
    track: 'bodyweight',
    focus: 'push',
    duration: 35,
    exercises: [
      { name: 'Push-ups',         sets: 4, reps: '15-20',  rest: '45s',  cue: 'Hands slightly wider than shoulders, elbows track at 45°.' },
      { name: 'Pike Push-ups',    sets: 3, reps: '10-12',  rest: '45s',  cue: 'Hips high, lower the crown of your head toward the floor.' },
      { name: 'Diamond Push-ups', sets: 3, reps: '8-10',   rest: '60s',  cue: 'Core tight throughout, thumbs and index fingers touching.' },
      { name: 'Decline Push-ups', sets: 3, reps: '10-12',  rest: '60s',  cue: 'Elevate feet to shift load onto upper chest.' },
      { name: 'Tricep Dips',      sets: 3, reps: '12-15',  rest: '45s',  cue: 'Elbows track straight back — not flaring to the sides.' },
    ],
  },
  {
    id: 'bw-push-b',
    type: 'Push Day B',
    track: 'bodyweight',
    focus: 'push',
    duration: 35,
    exercises: [
      { name: 'Wide Push-ups',           sets: 4, reps: '12-15',  rest: '45s',  cue: 'Hands 1.5× shoulder width, feel the chest stretch.' },
      { name: 'Pseudo Planche Push-ups', sets: 3, reps: '8-10',   rest: '60s',  cue: 'Lean forward over hands, protract the scapula.' },
      { name: 'Close-Grip Push-ups',     sets: 3, reps: '12-15',  rest: '45s',  cue: 'Elbows stay tight to ribs for the entire rep.' },
      { name: 'Elevated Pike Push-ups',  sets: 3, reps: '10-12',  rest: '60s',  cue: 'Feet on chair, forehead tracks down to the floor.' },
      { name: 'Wall Handstand Hold',     sets: 3, reps: '20-30s', rest: '60s',  cue: 'Press through shoulders, maintain hollow body position.' },
    ],
  },

  // ── BODYWEIGHT — PULL ────────────────────────────────────────────────────
  {
    id: 'bw-pull-a',
    type: 'Pull Day A',
    track: 'bodyweight',
    focus: 'pull',
    duration: 35,
    exercises: [
      { name: 'Australian Pull-ups',     sets: 4, reps: '10-12', rest: '60s',  cue: 'Bar at hip height, body rigid, pull chest to bar.' },
      { name: 'Pull-ups',                sets: 3, reps: 'max',   rest: '90s',  cue: 'Full dead hang at the bottom, chin clears bar at top.' },
      { name: 'Towel Rows',              sets: 3, reps: '12-15', rest: '60s',  cue: 'Wrap towel around door, lean back and drive elbows to hips.' },
      { name: 'Superman Hold',           sets: 3, reps: '30s',   rest: '45s',  cue: 'Squeeze glutes and upper back hard, arms fully extended.' },
      { name: 'Scapular Retractions',    sets: 3, reps: '15',    rest: '30s',  cue: 'Dead hang, squeeze shoulder blades together — no arm bend.' },
    ],
  },
  {
    id: 'bw-pull-b',
    type: 'Pull Day B',
    track: 'bodyweight',
    focus: 'pull',
    duration: 30,
    exercises: [
      { name: 'Chin-ups',            sets: 4, reps: 'max', rest: '90s',  cue: 'Palms toward you, squeeze biceps hard at the top.' },
      { name: 'Inverted Rows',       sets: 3, reps: '12-15', rest: '60s', cue: 'Body straight as a board, pull elbows past hips.' },
      { name: 'Good Mornings',       sets: 3, reps: '15',   rest: '45s',  cue: 'Hinge at hips, soft knee, load the hamstrings deliberately.' },
      { name: 'Scapular Pull-ups',   sets: 3, reps: '10',   rest: '45s',  cue: 'Depress shoulders from dead hang — no arm bend at all.' },
      { name: 'Negative Pull-ups',   sets: 3, reps: '5',    rest: '90s',  cue: '5-second descent from chin over bar to full dead hang.' },
    ],
  },

  // ── BODYWEIGHT — LEGS ────────────────────────────────────────────────────
  {
    id: 'bw-legs-a',
    type: 'Legs Day A',
    track: 'bodyweight',
    focus: 'legs',
    duration: 40,
    exercises: [
      { name: 'Bodyweight Squat',      sets: 4, reps: '20',      rest: '45s', cue: 'Chest up, knees track over toes, break parallel.' },
      { name: 'Reverse Lunges',        sets: 3, reps: '12 each', rest: '45s', cue: 'Back knee hovers one inch off the floor.' },
      { name: 'Jump Squats',           sets: 3, reps: '10',      rest: '60s', cue: 'Land soft — absorb through hips and knees, not joints.' },
      { name: 'Wall Sit',              sets: 3, reps: '45s',     rest: '60s', cue: '90° at the knee, do not let hips creep upward.' },
      { name: 'Single-Leg Calf Raise', sets: 3, reps: '20 each', rest: '30s', cue: 'Pause and squeeze hard at the top for one full second.' },
    ],
  },
  {
    id: 'bw-legs-b',
    type: 'Legs Day B',
    track: 'bodyweight',
    focus: 'legs',
    duration: 40,
    exercises: [
      { name: 'Bulgarian Split Squat', sets: 4, reps: '10 each', rest: '60s', cue: 'Rear foot elevated, torso upright, feel it in the front hip.' },
      { name: 'Glute Bridge',          sets: 4, reps: '15',      rest: '45s', cue: 'Drive through heels, hard squeeze and hold at the top.' },
      { name: 'Step-Ups',              sets: 3, reps: '12 each', rest: '45s', cue: 'Push through the lead heel — not the toes.' },
      { name: 'Box Jumps',             sets: 3, reps: '8',       rest: '60s', cue: 'Swing the arms, land quiet, full reset between reps.' },
      { name: 'Nordic Curl Hold',      sets: 3, reps: '6-8',     rest: '90s', cue: 'Slow the descent — that negative load builds hamstrings fast.' },
    ],
  },

  // ── BODYWEIGHT — FULL / CORE ─────────────────────────────────────────────
  {
    id: 'bw-core',
    type: 'Core Work',
    track: 'bodyweight',
    focus: 'full',
    duration: 25,
    exercises: [
      { name: 'Plank',              sets: 4, reps: '45s',     rest: '30s', cue: "Neutral spine, brace like you're about to take a punch." },
      { name: 'Hollow Body Hold',   sets: 3, reps: '30s',     rest: '45s', cue: 'Lower back pressed flat, arms and legs as low as possible.' },
      { name: 'Dead Bug',           sets: 3, reps: '10 each', rest: '30s', cue: 'Opposite arm and leg lower slowly — back stays completely flat.' },
      { name: 'Side Plank',         sets: 3, reps: '30s each',rest: '30s', cue: 'Stack feet or stagger — keep hips lifted throughout.' },
      { name: 'Hanging Knee Raises',sets: 3, reps: '15',      rest: '45s', cue: 'Control the swing, use abs to initiate each rep.' },
    ],
  },
  {
    id: 'bw-full',
    type: 'Full Body Circuit',
    track: 'bodyweight',
    focus: 'full',
    duration: 40,
    exercises: [
      { name: 'Burpees',          sets: 4, reps: '10',      rest: '60s', cue: 'Controlled descent, explosive jump, clap overhead.' },
      { name: 'Push-ups',         sets: 3, reps: '15',      rest: '45s', cue: 'Full range of motion, elbows at 45°, chest to floor.' },
      { name: 'Jump Lunges',      sets: 3, reps: '10 each', rest: '60s', cue: 'Switch mid-air, land with soft knees to protect the joints.' },
      { name: 'Pull-ups',         sets: 3, reps: 'max',     rest: '90s', cue: 'Dead hang start, chin over bar, full lockout at bottom.' },
      { name: 'Mountain Climbers',sets: 3, reps: '30s',     rest: '30s', cue: 'Drive knees to chest fast — keep hips level the whole time.' },
    ],
  },

  // ── BODYWEIGHT — REST ────────────────────────────────────────────────────
  {
    id: 'bw-rest',
    type: 'Active Rest',
    track: 'bodyweight',
    focus: 'rest',
    duration: 20,
    exercises: [
      { name: 'Easy Walk',    sets: 1, reps: '20-30 min', rest: '-', cue: "No phone. Breathe through your nose. Own the quiet." },
      { name: 'Mobility Flow',sets: 1, reps: '10 min',    rest: '-', cue: "Hip flexors, thoracic spine, ankles — stay where you're tight." },
    ],
  },

  // ── OUTDOOR ──────────────────────────────────────────────────────────────
  {
    id: 'out-sprints',
    type: 'Sprint Intervals',
    track: 'outdoor',
    focus: 'cardio',
    duration: 30,
    exercises: [
      { name: 'Warm-up Jog',       sets: 1, reps: '5 min',   rest: '-',   cue: 'Easy pace, get the blood moving before you push.' },
      { name: '100m Sprint',        sets: 8, reps: 'all-out', rest: '90s', cue: 'Drive knees high, arms forward and back — not across your body.' },
      { name: 'Walking Recovery',   sets: 8, reps: '90s',     rest: '-',   cue: 'Full recovery between efforts — the rest is part of the work.' },
      { name: 'Cool-down Walk',     sets: 1, reps: '5 min',   rest: '-',   cue: 'Drop your heart rate intentionally before you stop.' },
    ],
  },
  {
    id: 'out-circuit',
    type: 'Calisthenics Circuit',
    track: 'outdoor',
    focus: 'full',
    duration: 45,
    exercises: [
      { name: 'Push-ups',           sets: 4, reps: '20',  rest: '45s', cue: 'Chest to ground, lock out at the top.' },
      { name: 'Pull-ups (park bar)',sets: 4, reps: 'max', rest: '90s', cue: 'Full hang at bottom, chin over bar at top.' },
      { name: 'Bar Dips',           sets: 3, reps: '15',  rest: '60s', cue: 'Lean forward for chest, stay upright for triceps.' },
      { name: 'Box Jumps (bench)',  sets: 3, reps: '10',  rest: '60s', cue: "Two-foot takeoff, land soft, step down — don't jump down." },
      { name: 'L-Sit Hold',         sets: 3, reps: '20s', rest: '60s', cue: 'Legs parallel to ground, depress and retract the shoulders.' },
    ],
  },
  {
    id: 'out-ruck',
    type: 'Ruck / Loaded Walk',
    track: 'outdoor',
    focus: 'lower',
    duration: 60,
    exercises: [
      { name: 'Loaded Walk', sets: 1, reps: '45-60 min', rest: '-', cue: '20–30 lb pack, steady pace. Lean into the weight and own it.' },
    ],
  },
  {
    id: 'out-pullups',
    type: 'Pull-Up Ladder',
    track: 'outdoor',
    focus: 'pull',
    duration: 35,
    exercises: [
      { name: 'Dead Hang',            sets: 3, reps: 'max', rest: '60s',  cue: 'Builds grip and shoulder integrity from the ground up.' },
      { name: 'Pull-ups',             sets: 5, reps: 'max', rest: '120s', cue: 'Full ROM, no kipping. Earn every single rep.' },
      { name: 'Commando Pull-ups',    sets: 3, reps: '6 each side', rest: '90s', cue: 'Alternate sides, pull to each shoulder.' },
      { name: 'Negative Pull-ups',    sets: 3, reps: '5',   rest: '90s',  cue: 'Five-second descent. Eccentric load is where strength lives.' },
      { name: 'Australian Pull-ups',  sets: 3, reps: '15',  rest: '60s',  cue: 'Use as a finisher once the bar reps are spent.' },
    ],
  },
  {
    id: 'out-rest',
    type: 'Rest Day Walk',
    track: 'outdoor',
    focus: 'rest',
    duration: 30,
    exercises: [
      { name: 'Easy Walk', sets: 1, reps: '30 min', rest: '-', cue: 'No phone. No agenda. Move and let your mind settle.' },
    ],
  },

  // ── GYM — PUSH ───────────────────────────────────────────────────────────
  {
    id: 'gym-push-a',
    type: 'Push Day A',
    track: 'gym',
    focus: 'push',
    duration: 55,
    exercises: [
      { name: 'Barbell Bench Press',    sets: 4, reps: '5',     rest: '180s', cue: 'Arch slightly, bar touches low chest, drive through lockout.' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90s',  cue: '30–45° incline, feel the stretch at the bottom.' },
      { name: 'Overhead Press',         sets: 3, reps: '8',     rest: '120s', cue: 'Bar clears chin, press to lockout, rib cage stays down.' },
      { name: 'Cable Lateral Raise',    sets: 3, reps: '15',    rest: '60s',  cue: 'Lead with the elbow, slight forward lean.' },
      { name: 'Tricep Rope Pushdown',   sets: 3, reps: '15-20', rest: '60s',  cue: 'Spread rope at bottom, elbows fixed at sides.' },
    ],
  },
  {
    id: 'gym-push-b',
    type: 'Push Day B',
    track: 'gym',
    focus: 'push',
    duration: 50,
    exercises: [
      { name: 'Incline Barbell Press',    sets: 4, reps: '6-8',  rest: '180s', cue: 'Elbows at 45°, slight arch, control the descent.' },
      { name: 'Flat Dumbbell Press',      sets: 3, reps: '10-12',rest: '90s',  cue: 'Touch dumbbells at top, full stretch at the bottom.' },
      { name: 'Dumbbell Shoulder Press',  sets: 3, reps: '10',   rest: '90s',  cue: 'Neutral grip, press above the ears, no back bend.' },
      { name: 'Machine Chest Fly',        sets: 3, reps: '15',   rest: '60s',  cue: 'Feel the stretch, squeeze hard at center.' },
      { name: 'Skull Crushers',           sets: 3, reps: '12',   rest: '75s',  cue: 'Bar toward forehead, elbows stay completely fixed.' },
    ],
  },

  // ── GYM — PULL ───────────────────────────────────────────────────────────
  {
    id: 'gym-pull-a',
    type: 'Pull Day A',
    track: 'gym',
    focus: 'pull',
    duration: 55,
    exercises: [
      { name: 'Barbell Row',       sets: 4, reps: '6-8',  rest: '180s', cue: 'Hip hinge, bar to lower rib cage, hard squeeze at the top.' },
      { name: 'Lat Pulldown',      sets: 4, reps: '8-10', rest: '120s', cue: 'Full stretch at top, drive elbows to hips at bottom.' },
      { name: 'Seated Cable Row',  sets: 3, reps: '12',   rest: '90s',  cue: 'Chest up, pull to navel, hold for one second.' },
      { name: 'Dumbbell Shrug',    sets: 3, reps: '15',   rest: '60s',  cue: 'Straight up, hold two seconds at top, no rolling.' },
      { name: 'Barbell Curl',      sets: 3, reps: '10-12',rest: '75s',  cue: 'Elbows pinned at ribs, squeeze hard at the top.' },
    ],
  },
  {
    id: 'gym-pull-b',
    type: 'Pull Day B',
    track: 'gym',
    focus: 'pull',
    duration: 50,
    exercises: [
      { name: 'Deadlift',           sets: 4, reps: '5',       rest: '240s', cue: 'Bar over mid-foot, hinge back, neutral spine, drive the floor away.' },
      { name: 'T-Bar Row',          sets: 3, reps: '10',      rest: '120s', cue: 'Chest on pad, full range of motion, no jerking the weight.' },
      { name: 'Single-Arm DB Row',  sets: 3, reps: '12 each', rest: '75s',  cue: 'Brace on bench, pull elbow past hip, no rotation.' },
      { name: 'Face Pull',          sets: 3, reps: '20',      rest: '45s',  cue: 'Pull to face level, end with external rotation.' },
      { name: 'Hammer Curl',        sets: 3, reps: '12-15',   rest: '60s',  cue: 'Neutral grip targets the brachialis — slow it down.' },
    ],
  },

  // ── GYM — LEGS ───────────────────────────────────────────────────────────
  {
    id: 'gym-legs-a',
    type: 'Legs Day A',
    track: 'gym',
    focus: 'legs',
    duration: 60,
    exercises: [
      { name: 'Back Squat',          sets: 4, reps: '5',      rest: '240s', cue: 'Bar on traps, brace hard, break parallel, drive knees out.' },
      { name: 'Romanian Deadlift',   sets: 3, reps: '10-12',  rest: '120s', cue: 'Soft knee, hinge until you feel the hamstrings load.' },
      { name: 'Leg Press',           sets: 3, reps: '12-15',  rest: '90s',  cue: 'High and wide foot placement, full depth.' },
      { name: 'Walking Lunges',      sets: 3, reps: '12 each',rest: '75s',  cue: 'Step long, back knee hovers one inch off the floor.' },
      { name: 'Calf Raise (Machine)',sets: 4, reps: '20',     rest: '45s',  cue: 'Full stretch at bottom, hard pause at the top.' },
    ],
  },
  {
    id: 'gym-legs-b',
    type: 'Legs Day B',
    track: 'gym',
    focus: 'legs',
    duration: 55,
    exercises: [
      { name: 'Front Squat',          sets: 4, reps: '5',      rest: '240s', cue: 'Elbows high, upright torso, drive knees out aggressively.' },
      { name: 'Leg Curl',             sets: 3, reps: '12-15',  rest: '75s',  cue: 'Curl fully, hold the squeeze at peak contraction.' },
      { name: 'Hack Squat',           sets: 3, reps: '10-12',  rest: '90s',  cue: 'Feet shoulder-width, full depth if mobile.' },
      { name: 'Bulgarian Split Squat',sets: 3, reps: '10 each',rest: '90s',  cue: 'Loaded stretch on rear hip, keep the torso upright.' },
      { name: 'Seated Calf Raise',    sets: 4, reps: '20',     rest: '45s',  cue: 'Works the soleus — slow and full range every time.' },
    ],
  },

  // ── GYM — UPPER / LOWER ─────────────────────────────────────────────────
  {
    id: 'gym-upper',
    type: 'Upper Body',
    track: 'gym',
    focus: 'upper',
    duration: 55,
    exercises: [
      { name: 'Bench Press',           sets: 4, reps: '8',   rest: '120s', cue: 'Drive feet into floor, maintain arch, bar to low chest.' },
      { name: 'Barbell Row',           sets: 4, reps: '8',   rest: '120s', cue: 'Overhand grip, pull to belly button, squeeze the back.' },
      { name: 'Overhead Press',        sets: 3, reps: '8-10',rest: '90s',  cue: 'Strict form, lockout each rep, core braced throughout.' },
      { name: 'Pull-ups',              sets: 3, reps: 'max', rest: '90s',  cue: 'Full dead hang start, no kipping.' },
      { name: 'Dumbbell Lateral Raise',sets: 3, reps: '15',  rest: '45s',  cue: 'Lead with the elbow, stop at shoulder height.' },
    ],
  },
  {
    id: 'gym-lower',
    type: 'Lower Body',
    track: 'gym',
    focus: 'lower',
    duration: 55,
    exercises: [
      { name: 'Squat',             sets: 4, reps: '8',   rest: '180s', cue: 'Controlled 3-second descent, drive up through the whole foot.' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10',  rest: '120s', cue: 'Load the hamstrings intentionally — that tension is the point.' },
      { name: 'Leg Press',         sets: 3, reps: '15',  rest: '90s',  cue: "Don't lock knees at the top — keep tension on the muscle." },
      { name: 'Hip Thrust',        sets: 3, reps: '12',  rest: '75s',  cue: 'Bar over hips, drive through glutes, hard squeeze at top.' },
      { name: 'Leg Curl',          sets: 3, reps: '15',  rest: '60s',  cue: "Full range both directions — don't rush the descent." },
    ],
  },

  // ── GYM — REST ───────────────────────────────────────────────────────────
  {
    id: 'gym-rest',
    type: 'Active Rest',
    track: 'gym',
    focus: 'rest',
    duration: 20,
    exercises: [
      { name: 'Foam Rolling',   sets: 1, reps: '10 min', rest: '-', cue: 'Slow down over tight spots — let the tissue release.' },
      { name: 'Mobility Work',  sets: 1, reps: '10 min', rest: '-', cue: 'Hip flexors, thoracic spine, ankles. Invest in range of motion.' },
    ],
  },
]

// ── Split → day-of-week → focus ──────────────────────────────────────────────
// 0 = Sun … 6 = Sat

export const SPLIT_SCHEDULE = {
  ppl: {
    0: 'rest', 1: 'push', 2: 'pull', 3: 'legs',
    4: 'push', 5: 'pull', 6: 'legs',
  },
  upper_lower: {
    0: 'rest', 1: 'upper', 2: 'lower', 3: 'rest',
    4: 'upper', 5: 'lower', 6: 'rest',
  },
  full_body: {
    0: 'rest', 1: 'full', 2: 'rest', 3: 'full',
    4: 'rest', 5: 'full', 6: 'rest',
  },
  daily: null,  // hook selects any non-rest focus
}

/**
 * Returns workouts matching a track + focus.
 * For the 'daily' split (focus === null) returns all non-rest workouts.
 */
export function getWorkoutsForDay(track, split, dow) {
  const focusMap = SPLIT_SCHEDULE[split]
  const focus    = focusMap ? focusMap[dow] : null

  if (focus === 'rest') {
    return LIBRARY.filter(w => w.track === track && w.focus === 'rest')
  }
  if (focus) {
    return LIBRARY.filter(w => w.track === track && w.focus === focus)
  }
  // daily split — any non-rest workout for this track
  return LIBRARY.filter(w => w.track === track && w.focus !== 'rest')
}

export default LIBRARY

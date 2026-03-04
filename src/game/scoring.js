/**
 * Points per attempt number (1st, 2nd, 3rd+)
 */
export function calcPoints(attemptNum) {
  if (attemptNum === 1) return 15;
  if (attemptNum === 2) return 10;
  return 5;
}

/**
 * First-try accuracy as a percentage (0–100, integer)
 */
export function calcAccuracy(firstTryOk, solved) {
  if (solved === 0) return 0;
  return Math.round((firstTryOk / solved) * 100);
}

/**
 * Grade, trophy emoji, title, and message based on accuracy + questions solved.
 */
export function calcGrade(acc, solved) {
  if (acc >= 90 && solved >= 10)
    return { grade: 'S', trophy: '🏆', title: 'Outstanding!',
             msg: "You're a true Math Titan — incredible accuracy and speed!" };
  if (acc >= 75)
    return { grade: 'A', trophy: '🥇', title: 'Excellent!',
             msg: 'Sharp mind and great accuracy. Well played!' };
  if (acc >= 55)
    return { grade: 'B', trophy: '🥈', title: 'Good Job!',
             msg: "Solid performance. Keep practising and you'll be unstoppable." };
  return   { grade: 'C', trophy: '🥉', title: 'Keep Going!',
             msg: "Every attempt makes you sharper. Give it another go!" };
}

export interface AttendancePrediction {
  courseId: string;
  currentPercentage: number;
  targetPercentage: number;
  status: "safe" | "warning" | "danger";
  classesAttended: number;
  classesTotal: number;
  canMissClassesCount: number;  // How many more classes they can miss before dropping below target
  mustAttendClassesCount: number; // How many consecutive classes they must attend to reach target
}

export function calculatePrediction(
  attended: number,
  total: number,
  target: number = 75
): AttendancePrediction {
  const current = total > 0 ? Math.round((attended / total) * 100) : 100;
  const targetFraction = target / 100;

  let canMiss = 0;
  let mustAttend = 0;

  if (current >= target) {
    // Student is safe or at target. Calculate how many classes they can miss.
    // Attended / (Total + m) >= targetFraction => m <= (Attended / targetFraction) - Total
    if (targetFraction > 0) {
      canMiss = Math.floor(attended / targetFraction - total);
    }
  } else {
    // Student is below target. Calculate how many consecutive classes they must attend.
    // (Attended + a) / (Total + a) >= targetFraction => a >= (targetFraction * Total - Attended) / (1 - targetFraction)
    if (targetFraction < 1) {
      mustAttend = Math.ceil((targetFraction * total - attended) / (1 - targetFraction));
    } else {
      // Aiming for 100% attendance. If they have missed even one class, they can never reach 100% again.
      mustAttend = Infinity;
    }
  }

  let status: "safe" | "warning" | "danger" = "safe";
  if (current < target) {
    status = "danger";
  } else if (current - target <= 5) {
    status = "warning"; // Within 5% of dropping below target
  }

  return {
    courseId: "",
    currentPercentage: current,
    targetPercentage: target,
    status,
    classesAttended: attended,
    classesTotal: total,
    canMissClassesCount: Math.max(0, canMiss),
    mustAttendClassesCount: Math.max(0, mustAttend),
  };
}

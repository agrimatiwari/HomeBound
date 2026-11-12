/**
 * Computes day difference between two YYYY-MM-DD strings.
 */
export function daysApart(dateA, dateB) {
  const msA = new Date(`${dateA}T12:00:00`).getTime();
  const msB = new Date(`${dateB}T12:00:00`).getTime();
  if (Number.isNaN(msA) || Number.isNaN(msB)) return Infinity;
  return Math.round(Math.abs(msA - msB) / 86400000);
}

/**
 * Checks whether two departure time windows are compatible.
 */
export function timeCompatible(timeA, timeB) {
  if (!timeA || !timeB || timeA === 'Anytime' || timeB === 'Anytime' || timeA === timeB) return true;
  return (timeA === 'Morning' && timeB === 'Afternoon') || (timeA === 'Afternoon' && timeB === 'Morning');
}

/**
 * Checks whether travel dates align (exact date, or within 1 day if either plan is flexible).
 */
export function isDateCompatible(planA, planB) {
  const diff = daysApart(planA.date, planB.date);
  if (diff === 0) return true;
  if ((planA.flexible || planB.flexible) && diff <= 1) return true;
  return false;
}

/**
 * Evaluates compatibility between two active travel plans based on destination,
 * nearby cities, dates, flexibility, starting location, time window, and student preferences.
 * Returns null if incompatible, or an explanation object with structured badges and score.
 */
export function evaluatePlanMatch(planA, planB, studentA = null, studentB = null) {
  if (!planA || !planB) return null;
  if ((planA.status && planA.status !== 'active') || (planB.status && planB.status !== 'active')) return null;

  const destA = planA.destination.trim().toLowerCase();
  const destB = planB.destination.trim().toLowerCase();
  const listA = [planA.destination, ...(planA.nearby || [])].map(c => c.trim()).filter(Boolean);
  const listB = [planB.destination, ...(planB.nearby || [])].map(c => c.trim()).filter(Boolean);

  const exactDestination = destA === destB;
  const matchedCity = exactDestination
    ? planB.destination.trim()
    : listA.find(cityA => listB.some(cityB => cityB.toLowerCase() === cityA.toLowerCase()));

  if (!matchedCity) return null;
  if (!isDateCompatible(planA, planB)) return null;

  const exactDate = planA.date === planB.date;
  const sameOrigin = (planA.from || '').trim().toLowerCase() === (planB.from || '').trim().toLowerCase();
  const timingAligned = timeCompatible(planA.time, planB.time);

  const prefsA = (studentA?.preferences || []).map(p => p.trim().toLowerCase());
  const prefsB = (studentB?.preferences || []).map(p => p.trim().toLowerCase());
  const sharedPrefs = (studentB?.preferences || []).filter(p => prefsA.includes(p.trim().toLowerCase()));

  // Weighted scoring grounded in actual travel criteria (no arbitrary percentages)
  let score = 0;
  score += exactDestination ? 5 : 3;
  score += exactDate ? 4 : 2;
  if (sameOrigin) score += 2;
  if (timingAligned) score += 1;
  score += Math.min(2, sharedPrefs.length);

  const labels = [
    exactDestination ? 'Exact Destination Match' : 'Nearby Destination',
    exactDate ? 'Same Travel Date' : 'Flexible Date Match'
  ];
  if (sameOrigin) labels.push('Same Starting Point');

  const reasons = [
    exactDestination ? `Same destination (${matchedCity})` : `Nearby destination (${matchedCity})`,
    exactDate ? 'Same travel date' : 'Flexible date (±1 day)',
    sameOrigin ? `Same start (${planB.from})` : '',
    timingAligned ? `Compatible time (${planB.time})` : '',
    sharedPrefs.length ? `Shared style: ${sharedPrefs.slice(0, 2).join(', ')}` : ''
  ].filter(Boolean);

  return {
    exactDestination,
    exactDate,
    sameOrigin,
    timingAligned,
    matchedCity,
    sharedPrefs,
    labels,
    score,
    reason: reasons.join(' · ')
  };
}

/**
 * Generates deduplicated, sorted travel partner recommendations for a given user.
 * Excludes the user's own plans and any non-active (paused/completed/cancelled) plans.
 */
export function findSuggestedMatches(state, userId) {
  const myActivePlans = state.plans.filter(p => p.owner === userId && (p.status || 'active') === 'active');
  if (!myActivePlans.length) return [];

  const currentUser = state.students.find(s => s.id === userId) || (state.user?.id === userId ? state.user : null);
  const candidatePlans = state.plans.filter(p => p.owner !== userId && (p.status || 'active') === 'active');

  const results = [];
  const seenPlanIds = new Set();

  for (const candidate of candidatePlans) {
    if (seenPlanIds.has(candidate.id)) continue;
    const candidateStudent = state.students.find(s => s.id === candidate.owner) || null;

    let bestMatch = null;
    for (const myPlan of myActivePlans) {
      const m = evaluatePlanMatch(myPlan, candidate, currentUser, candidateStudent);
      if (m && (!bestMatch || m.score > bestMatch.score)) {
        bestMatch = m;
      }
    }

    if (bestMatch) {
      seenPlanIds.add(candidate.id);
      results.push({ plan: candidate, match: bestMatch });
    }
  }

  return results.sort((a, b) => b.match.score - a.match.score || a.plan.date.localeCompare(b.plan.date));
}

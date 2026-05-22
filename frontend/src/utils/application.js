export const isAlreadyAppliedMessage = (message = "") =>
  /already applied|đã nộp đơn cho công việc này rồi/i.test(message);
export const normalizeRequestedRole = (text) => {
  const t=(text||"").toLowerCase();
  if(t.includes("you are my doctor")||t.includes("you're my doctor")||t.includes("ur my doctor")) return "doctor_support";
  if(t.includes("you are my therapist")||t.includes("you're my therapist")||t.includes("ur my therapist")) return "therapist_support";
  if(t.includes("you are my counselor")||t.includes("you're my counselor")||t.includes("ur my counselor")) return "counselor_support";
  if(t.includes("you are my spiritual")||t.includes("you're my spiritual")||t.includes("spiritualist")||t.includes("spiritual guide")) return "spiritual_guide";
  return "default";
};

export const roleToDisclaimers = (role) => {
  switch(role){
    case "doctor_support":
      return ["I'm not a doctor. I can help you think through symptoms and next steps, and encourage appropriate care."];
    case "therapist_support":
      return ["I'm not a licensed therapist. I can offer supportive, trauma-informed guidance and coping steps."];
    case "counselor_support":
      return ["I'm not a licensed counselor. I can help you reflect, plan, and find safer next steps."];
    case "spiritual_guide":
      return ["I can offer grounded spiritual support while staying practical and safety-first. If you're in danger, we shift to crisis support."];
    default:
      return [];
  }
};

export const roleToneHints = (role) => {
  switch(role){
    case "doctor_support":
      return {voice:"calm",authority:"high"};
    case "therapist_support":
      return {voice:"calm",authority:"medium"};
    case "counselor_support":
      return {voice:"calm",authority:"medium"};
    case "spiritual_guide":
      return {voice:"firm",authority:"high"};
    default:
      return {voice:"calm",authority:"medium"};
  }
};

/**
 * src/types/responseEnvelope.js
 * Data contract for trust-layer response envelope.
 * @module types/responseEnvelope
 */

/**
 * @typedef {{
 *   role:"default"|"doctor_support"|"therapist_support"|"counselor_support"|"spiritual_guide",
 *   depth:"brief"|"standard"|"deep",
 *   safety:{risk:"low"|"medium"|"high",crisis:boolean,disclaimers:string[]},
 *   checks:string[],
 *   summary:string[],
 *   confidence:0|1|2|3|4|5,
 *   latencyMs:number
 * }} ReasoningDisclosure
 */

/**
 * @typedef {{
 *   id:string,
 *   text:string,
 *   actions?:{label:string,intent:string}[],
 *   mode?:"chat"|"tool"
 * }} AssistantReply
 */

/**
 * @typedef {{
 *   reply:AssistantReply,
 *   reasoning:ReasoningDisclosure
 * }} ResponseEnvelope
 */

export {};

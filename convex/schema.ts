import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
// Domain payloads are shared/contracts.ts types; API arguments and effect admission are validated separately.
export default defineSchema({
  trips: defineTable({scenarioId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']),
  transport: defineTable({scenarioId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']),
  hotels: defineTable({scenarioId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']),
  operations: defineTable({scenarioId:v.string(),operationId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']).index('by_operation',['scenarioId','operationId']),
  receipts: defineTable({scenarioId:v.string(),operationId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']).index('by_operation',['scenarioId','operationId']),
  events: defineTable({scenarioId:v.string(),eventId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']).index('by_event',['scenarioId','eventId']),
  traces: defineTable({scenarioId:v.string(),state:v.any()}).index('by_scenario',['scenarioId']),
});

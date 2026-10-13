import { describe, expect, it } from "vitest";
import { getPractitionerWorkspaceContract, isCareCoordinationWorkspace, PLANNED_WORKSPACE_TRACKS } from "./practitionerWorkspaceContracts";

describe("practitioner workspace contracts", () => {
  it("provides a distinct case-management dashboard contract", () => {
    const workspace = getPractitionerWorkspaceContract("case-manager");
    expect(workspace.label).toBe("Case management");
    expect(workspace.primaryAction.path).toBe("/provider/clients");
    expect(workspace.careCoordination).toBe(true);
    expect(isCareCoordinationWorkspace("case-manager")).toBe(true);
  });

  it("keeps only a narrow PCP pilot available while organization and justice supervision remain gated", () => {
    expect(PLANNED_WORKSPACE_TRACKS.find(({ id }) => id === "primary-care").status).toBe("limited-pilot");
    expect(PLANNED_WORKSPACE_TRACKS.find(({ id }) => id === "organization").status).toBe("planned");
    expect(PLANNED_WORKSPACE_TRACKS.find(({ id }) => id === "community-supervision").status).toBe("separate-review");
    expect(isCareCoordinationWorkspace("probation-officer")).toBe(false);
  });

  it("offers a distinct, narrow primary-care workspace contract", () => {
    const workspace = getPractitionerWorkspaceContract("primary-care");
    expect(workspace.label).toBe("Primary care");
    expect(workspace.primaryCare).toBe(true);
    expect(workspace.limitedAccess).toBe(true);
    expect(workspace.updatesHeading).toMatch(/patient-selected visit preparation/i);
  });
});

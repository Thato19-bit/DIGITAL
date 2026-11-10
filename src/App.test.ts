import { describe, expect, it } from "vitest"
import { canAccess, premiumForCoverage, yieldForCrop } from "./App"

describe("role permissions", () => {
  it("keeps administration restricted to administrators", () => {
    expect(canAccess("Admin", "admin")).toBe(true)
    expect(canAccess("Farmer", "admin")).toBe(false)
    expect(canAccess("Buyer", "verification")).toBe(false)
  })

  it("exposes role-specific operational modules", () => {
    expect(canAccess("Farmer", "livestock")).toBe(true)
    expect(canAccess("Agricultural Officer", "verification")).toBe(true)
    expect(canAccess("Buyer", "orders")).toBe(true)
  })
})

describe("farm calculators", () => {
  it("calculates crop-specific yield", () => {
    expect(yieldForCrop(12, "Maize")).toBe(45.6)
    expect(yieldForCrop(10, "Beans")).toBe(24)
  })

  it("calculates the demonstrated insurance premium", () => {
    expect(premiumForCoverage(4500)).toBe(280)
    expect(premiumForCoverage(8000)).toBe(498)
  })
})

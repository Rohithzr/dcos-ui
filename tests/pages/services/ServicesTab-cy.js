describe("ServicesTab", function() {
  context("Service not found page", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/non-existing-service" });
    });

    it("should show the 'Not Found' alert panel", function() {
      cy.get(".page-body-content").contains("Page not found");
    });
  });
});

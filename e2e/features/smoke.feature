Feature: Games Collection smoke tests
  The deployed application should support the most important user journeys.

  Scenario: Anonymous user is redirected to login when opening a protected route
    When I open the protected route "/collection"
    Then I should be on the login page

  Scenario: User can sign in and open the collection page
    Given I am on the login page
    When I sign in with the default user
    Then I should see the collection page

  Scenario: User can open the account menu and sign out
    Given I am signed in as the default user
    When I open the account menu
    Then I should see the account menu
    When I sign out from the account menu
    Then I should be on the login page

  Scenario: Regular user does not see admin navigation entries
    Given I am signed in as the default user
    When I open the account menu
    Then I should not see the inventory navigation entry
    And I should not see the users navigation entry

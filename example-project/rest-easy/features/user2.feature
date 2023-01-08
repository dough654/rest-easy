Feature: User Creation

	Scenario: Create a basic user 2
		Given the details for bob smith
		When creating a new user for him
		Then Bob Smith's user is created successfully


/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function ()
{
	var finish;
	var valueOf;
	var Passbook;
	
	this.init = function (testUtils)
	{
		finish = testUtils.finish;
		valueOf = testUtils.valueOf;
		Passbook = require('ti.passbook');
	};

	this.name = "passbook";
	
	// ---------------------------------------------------------------
	// Passbook
	// ---------------------------------------------------------------

	// Test that module is loaded
	this.testModule = function (testRun)
	{
		// Verify that the module is defined
		valueOf(testRun, Passbook).shouldBeObject();
		finish(testRun);
	};
	
	// Test that all of the Functions are defined
	this.testFunctions = function (testRun)
	{
		valueOf(testRun, Passbook.isPassLibraryAvailable).shouldBeFunction();
		valueOf(testRun, Passbook.addPass).shouldBeFunction();
		valueOf(testRun, Passbook.addPasses).shouldBeFunction();
		valueOf(testRun, Passbook.containsPass).shouldBeFunction();
		valueOf(testRun, Passbook.removePass).shouldBeFunction();
		valueOf(testRun, Passbook.replacePass).shouldBeFunction();
		valueOf(testRun, Passbook.getPass).shouldBeFunction();
		valueOf(testRun, Passbook.showPass).shouldBeFunction();
		
		finish(testRun);
	};
	
	// Test that all of the Properties are defined
	this.testProperties = function (testRun)
	{
		valueOf(testRun, Passbook.passes).shouldBeArray(); //read only

		finish(testRun);
	};
	
	this.testIsPassLibraryAvailable = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.isPassLibraryAvailable();
		}).shouldNotThrowException();

		valueOf(testRun, Passbook.isPassLibraryAvailable()).shouldBeTrue();

		finish(testRun);
	};

	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this);
};

/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function ()
{
	var passFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'passes', 'Lollipop.pkpass');
	var passFileBad = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'passes', 'LollipopBad.pkpass');
	var passFileNewURL = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'passes', 'LollipopNewURL.pkpass');
	var passTypeIdentifier = "pass.com.appc.passkit.lollipop";
	var serialNumber = "E5982H-I2";
	var customKey = "westley";

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
	// Pass
	//
	// This suite requires user interaction
	// ---------------------------------------------------------------

	this.testSetup = function (testRun)
	{
		// Ensure that there are no passes in library before starting tests
		var passes = Passbook.passes;
		for (var i = 0, j = passes.length; i < j; i++) {
			Passbook.removePass(passes.pop());
		}
		
		finish(testRun);
	};

	// Requires user interaction
	this.testAddPassInvalidArguments = function (testRun)
	{
		function listenerShouldNotBeCalled() {
			// This should never be called
			valueOf(testRun, false).shouldBeTrue();
		}

		Passbook.addEventListener('addedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('removedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('replacedpasses', listenerShouldNotBeCalled);

		valueOf(testRun, function() {
			Passbook.addPass();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass(passFile.blob);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass(5);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass("inconceivable");
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass({
				pass: passFile.blob
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass({
				passData: passFile
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass({
				passData: 5
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.addPass({
				passData: "Vizzini"
			});
		}).shouldThrowException();
		
		Passbook.removeEventListener('addedpasses', listenerShouldNotBeCalled);
		Passbook.removeEventListener('removedpasses', listenerShouldNotBeCalled);
		Passbook.removeEventListener('replacedpasses', listenerShouldNotBeCalled);

		finish(testRun);
	};

	this.testContainsPassProxyInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.containsPass({ 
				wrong:passFile.blob 
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.containsPass( passFile.blob );
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.containsPass( 5 );
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.containsPass( "Fezzik" );
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.containsPass({ 
				passData: 5 
			});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.containsPass({ 
				passData: "Humperdinck"
			});
		}).shouldThrowException();

		finish(testRun);
	};

	this.testAddPassWithBadPassFile = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.addPass({
				passData: passFileBad.blob
			});
		}).shouldThrowException();

		finish(testRun);
	};

	this.testContainsPassWithBadPassFile = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.containsPass({
				passData: passFileBad.blob
			});
		}).shouldThrowException();

		finish(testRun);
	};

	this.testContainsPassProxyFail = function (testRun)
	{
		var success = Passbook.containsPass({ 
			passData:passFile.blob 
		});
		valueOf(testRun, success).shouldBeFalse();

		finish(testRun);
	};

	this.testAddPass = function (testRun)
	{
		function listenerShouldNotBeCalled() {
			// This should never be called
			valueOf(testRun, false).shouldBeTrue();
		}
		function onAddedPasses(e) {
			valueOf(testRun, e.passes).shouldBeArray();
			valueOf(testRun, e.passes[0]).shouldBeObject();
			valueOf(testRun, e.passes[0].webServiceURL).shouldBeString();

			Passbook.removeEventListener('removedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('replacedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('addedpasses', onAddedPasses);

			finish(testRun);
		}

		Passbook.addEventListener('removedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('replacedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('addedpasses', onAddedPasses);

		valueOf(testRun, function() {
			Passbook.addPass({
				passData: passFile.blob
			});
		}).shouldNotThrowException();
	};

	this.testContainsPassProxyPass = function (testRun)
	{
		valueOf(testRun, Passbook.containsPass({ 
			passData:passFile.blob 
		})).shouldBeTrue();

		finish(testRun);
	};

	this.testPassesProperty = function (testRun)
	{
		var passes = Passbook.passes;

		valueOf(testRun, passes.length).shouldBe(1);
		valueOf(testRun, passes[0]).shouldBeObject();

		finish(testRun);
	};

	this.testGetPassInvalidArguments = function (testRun)
	{
		var pass;

		valueOf(testRun, function() {
			pass = Passbook.getPass({
				serialNumber: serialNumber
			});
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass({
				passTypeIdentifier: 5,
				serialNumber: serialNumber
			});
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass({
				passTypeIdentifier: passTypeIdentifier
			});
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass({
				passTypeIdentifier: passTypeIdentifier,
				serialNumber: 5
			});
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass();
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass({});
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass(passTypeIdentifier);
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		valueOf(testRun, function() {
			pass = Passbook.getPass(serialNumber);
		}).shouldThrowException();
		valueOf(testRun, pass).shouldBeUndefined();

		finish(testRun);
	};

	this.testGetPassNoPass = function (testRun)
	{
		var pass = Passbook.getPass({
			passTypeIdentifier: "badid",
			serialNumber: "badserial"
		});
		valueOf(testRun, pass).shouldBeUndefined();

		finish(testRun);
	};

	this.testGetPass = function (testRun)
	{
		var pass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});
		valueOf(testRun, pass).shouldBeObject();

		finish(testRun);
	};

	this.testPassProxy = function (testRun)
	{
		var pass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});
		
		valueOf(testRun, pass.passURL).shouldBeString();
		valueOf(testRun, pass.authenticationToken).shouldBeString();
		valueOf(testRun, pass.passTypeIdentifier).shouldBeString();
		valueOf(testRun, pass.serialNumber).shouldBeString();
		valueOf(testRun, pass.webServiceURL).shouldBeString();
		valueOf(testRun, pass.localizedName).shouldBeString();
		valueOf(testRun, pass.localizedDescription).shouldBeString();
		valueOf(testRun, pass.organizationName).shouldBeString();
		valueOf(testRun, pass.relevantDate).shouldBeObject();
		valueOf(testRun, pass.icon).shouldBeObject();

		valueOf(testRun, pass.localizedValueForFieldKey).shouldBeFunction();

		finish(testRun);
	};

	this.testLocalizedValueForFieldKey = function (testRun)
	{
		var pass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});

		valueOf(testRun, pass.localizedValueForFieldKey( customKey )).shouldBeString();
		valueOf(testRun, pass.localizedValueForFieldKey( "notakey" )).shouldBeUndefined();
		valueOf(testRun, function() {
			pass.localizedValueForFieldKey( 5 );
		}).shouldThrowException();

		finish(testRun);
	};

	this.testReplacePassInvalidArguments = function (testRun)
	{
		var success = false;

		valueOf(testRun, function() {
			success = Passbook.replacePass(serialNumber);
		}).shouldThrowException();
		valueOf(testRun, success).shouldBeFalse();

		valueOf(testRun, function() {
			success = Passbook.replacePass({
				passData: passFileNewURL
			});	
		}).shouldThrowException();
		valueOf(testRun, success).shouldBeFalse();

		valueOf(testRun, function() {
			success = Passbook.replacePass({
				passData: 5
			});
		}).shouldThrowException();
		valueOf(testRun, success).shouldBeFalse();

		valueOf(testRun, function() {
			success = Passbook.replacePass({
				passData: "Hi, my name is Inigo Montoya"
			});
		}).shouldThrowException();
		valueOf(testRun, success).shouldBeFalse();

		finish(testRun);
	};

	this.testReplacePassWithBadPassFile = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.replacePass({
				passData: passFileBad.blob
			});
		}).shouldThrowException();

		finish(testRun);
	};

	this.testReplacePass = function (testRun)
	{
		var success = false;
		
		function listenerShouldNotBeCalled() {
			// This should never be called
			valueOf(testRun, false).shouldBeTrue();
		}
		function onReplacedPasses(e) {
			valueOf(testRun, e.passes).shouldBeArray();
			valueOf(testRun, e.passes[0]).shouldBeObject();
			valueOf(testRun, e.passes[0].webServiceURL).shouldBe( newPass.webServiceURL );

			Passbook.removeEventListener('removedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('addedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('replacedpasses', onReplacedPasses);

			finish(testRun);
		}

		Passbook.addEventListener('removedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('addedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('replacedpasses', onReplacedPasses);

		var oldPass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});

		valueOf(testRun, function() {
			success = Passbook.replacePass({
				passData: passFileNewURL.blob
			});	
		}).shouldNotThrowException();
		valueOf(testRun, success).shouldBeTrue();

		var newPass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});

		valueOf(testRun, oldPass.webServiceURL).shouldNotBe( newPass.webServiceURL );
	};

	this.testShowPassInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.showPass();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.showPass({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.showPass(null);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.showPass("Buttercup");
		}).shouldThrowException();

		finish(testRun);
	};

	this.testRemovePassInvalidArguments = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.removePass();
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.removePass({});
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.removePass(null);
		}).shouldThrowException();
		valueOf(testRun, function() {
			Passbook.removePass("to blave");
		}).shouldThrowException();

		finish(testRun);
	};

	this.testRemovePass = function (testRun)
	{
		function listenerShouldNotBeCalled() {
			// This should never be called
			valueOf(testRun, false).shouldBeTrue();
		}
		function onRemovedPasses(e) {
			valueOf(testRun, e.passIds).shouldBeArray();
			valueOf(testRun, e.passIds[0]).shouldBeObject();
			valueOf(testRun, e.passIds[0].passTypeIdentifier).shouldBe( passTypeIdentifier );
			valueOf(testRun, e.passIds[0].serialNumber).shouldBe( serialNumber );

			Passbook.removeEventListener('replacedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('addedpasses', listenerShouldNotBeCalled);
			Passbook.removeEventListener('removedpasses', onRemovedPasses);

			finish(testRun);
		}

		Passbook.addEventListener('replacedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('addedpasses', listenerShouldNotBeCalled);
		Passbook.addEventListener('removedpasses', onRemovedPasses);

		var pass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});

		valueOf(testRun, function() {
			Passbook.removePass(pass);
		}).shouldNotThrowException();

		var oldPass = Passbook.getPass({
			passTypeIdentifier: passTypeIdentifier,
			serialNumber: serialNumber
		});

		valueOf(testRun, oldPass).shouldBeUndefined();
	};

	this.testReplacePassNotInLibrary = function (testRun)
	{
		valueOf(testRun, function() {
			Passbook.replacePass({
				passData: passFileBad.blob
			});
		}).shouldThrowException();

		finish(testRun);
	};

	this.testPassesPropertyWithNoPasses = function (testRun)
	{
		var passes = Passbook.passes;

		valueOf(testRun, passes.length).shouldBe(0);

		finish(testRun);
	};

	// Populate the array of tests based on the 'hammer' convention
	this.tests = require('hammer').populateTests(this, 30000);
};

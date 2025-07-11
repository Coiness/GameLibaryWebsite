
// Let's create a namespace for some of the internal methods
var admin = {};

// Validate data and submit form for new publisher
function BSubmitNewPartner()
{
	sPublisher = document.getElementById( 'publishername' ).value;
	if ( !sPublisher || sPublisher.length < 3 )
	{
		alert( 'Invalid partner name' );
		return false;
	}

	sConfirmTxt = 'Are you sure you want to add a partner named: ' + sPublisher + '?';
	return confirm(sConfirmTxt);
}

// Validate data and submit form for new application
function BSubmitNewAppID()
{
	var sConfirmTxt = 'Are you sure you want to add an app with ID: ' + document.getElementById( 'appId' ).value + '?';
	return confirm(sConfirmTxt);
}

function BVerifyPartnerDelete()
{
	return confirm( "Are you sure you want to delete this partner and all its users/permissions?" );
}

// Validate data and submit form for new publisher/app relationship
function BAffiliateAppWithPublisher( sPublisherName )
{
	iApp = document.getElementById( 'appid' ).value;

	sConfirmTxt = 'Are you sure you want to allow ' + sPublisherName +' access to: ' + iApp + '?';
	return confirm(sConfirmTxt);
}

function BVerifyAppDelete( sAppName, sPublisherName )
{
	return confirm( 'Are you sure you want to remove admin access for ' + sAppName + ' from ' + sPublisherName + '?' );
}

// Validate data and submit form for new publisher autogrant
function BSubmitNewAutogrant( sPublisherName )
{
	unPackageID = document.getElementById( 'packageid' ).value;

	sConfirmTxt = 'Are you sure you want all users from ' + sPublisherName +' to own package ' + unPackageID + '?';
	return confirm(sConfirmTxt);
}

function BVerifyAutograntDelete( unPackageID, sPublisherName )
{
	return confirm( 'Are you sure you want to remove licenses for ' + unPackageID + ' for users from ' + sPublisherName + '?' );
}

// Code for AddPublished modal box
// Refactor modal box code (here) so we can reduce the number of implementations.
var g_CustomIdBeingEdited;

// Functions to get viewport and scroll offset are coming from here (works better than others I found on the web):
//	http://stevenbenner.com/2010/04/calculate-page-size-and-view-port-position-in-javascript/

function GetViewportSize()
{
	var viewportWidth, viewportHeight;
	if (window.innerHeight && window.scrollMaxY)
	{
		viewportWidth = document.body.scrollWidth;
		viewportHeight = window.innerHeight + window.scrollMaxY;
	}
	else if (document.body.scrollHeight > document.body.offsetHeight)
	{
		// all but explorer mac
		viewportWidth = document.body.scrollWidth;
		viewportHeight = document.body.scrollHeight;
	}
	else
	{
		// explorer mac...would also work in explorer 6 strict, mozilla and safari
		viewportWidth = document.body.offsetWidth;
		viewportHeight = document.body.offsetHeight;
	}
	return { Width: viewportWidth, Height: viewportHeight };
}

function GetScrollOffsets()
{
	var horizontalOffset, verticalOffset;
	if (self.pageYOffset)
	{
		horizontalOffset = self.pageXOffset;
		verticalOffset = self.pageYOffset;
	}
	else if (document.documentElement && document.documentElement.scrollTop)
	{
		// Explorer 6 Strict
		horizontalOffset = document.documentElement.scrollLeft;
		verticalOffset = document.documentElement.scrollTop;
	} else if (document.body)
	{
		// all other Explorers
		horizontalOffset = document.body.scrollLeft;
		verticalOffset = document.body.scrollTop;
	}
	return { Horizontal: horizontalOffset, Vertical: verticalOffset };
}

// Found this in another page but seems to work as expected
function GetWindowSize()
{
	// Handle IE and other browsers
	var winW = 630, winH = 460;
	if (document.body && document.body.offsetWidth)
	{
		winW = document.body.offsetWidth;
		winH = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth )
	{
		winW = document.documentElement.offsetWidth;
		winH = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight)
	{
		winW = window.innerWidth;
		winH = window.innerHeight;
	}
	return { Width: winW, Height: winH };
}

function OpenAddPartnerBox( customId )
{
	g_CustomIdBeingEdited = customId;

	var editBox = $( 'editBox' );
	var overlay = $( 'overlay' );
	var editTitle = $( 'editTitle' );
	var editText = $( 'partnerName' );

	editText.value = '';

	overlay.style.display = 'inline';
	editBox.style.display = 'inline';

	// Now that it is displayed we can update the position (as we have clientWidth and clientHeight now)

	// Calculate viewport dimension (the whole page) so overlay covers everything. In I.E. height:100% only means what is visible
	// However the method works only if we don't increase the size of the window outside what is visible.
	// If we use '100%', it mostly works however ins some particular cases (small window, then scrolling, we can see the overlay being set incorrectly)
	// It is better than setting width to a big size like 8192, as otherwise we could see the full 8192 size in the scroll bars.

	var windowSize = GetWindowSize();
	var winW = windowSize.Width;
	var winH = windowSize.Height;
	var objW = editBox.clientWidth;
	var objH = editBox.clientHeight;
	var left = (winW / 2) - (objW / 2);
	var top = (winH / 2) - (objH / 2);
	top += GetScrollOffsets().Vertical;
	editBox.style.top = ( top > 0 ? top : 0 ) + 'px';
	editBox.style.left = ( left > 0 ? left : 0 ) + 'px';

	editText.focus();
}

function CommitAddPartnerBox()
{
	var partnerName = $( 'partnerName' ).value;

	// Commit this to the DB, update the UI once it is done
	// The PHP size (and WG) calls this a publisher. There is way too many things to change, do the translation at this level.
	new Ajax.Request( g_szBaseURL + '/admin/addpublisherajax',
			{
				parameters: { 'publishername':  partnerName, 'sessionid' : g_sessionID },
				method: 'post',
				requestHeaders: { 'Accept': 'application/json' },
				onSuccess: function ( transport )
				{
					var partnerId = transport.responseText;
					if ( partnerId != '' )
					{
						// Now that we created the application and that's successful, let's update the combo box
						var optionElement = document.createElement( 'option' );
						optionElement.text = partnerName;
						optionElement.value = partnerId;
						$( 'partnerId' ).appendChild( optionElement );		// For the moment we add the option to the end of the combo list
						optionElement.selected = true;					// And let's assume that if the user created a new partner, (s)he wants to select it
					}
					else
					{
						alert( "Could not add partner '" + partnerName + "'. It probably already exists." );
					}
				},
				onFailure: function ( transport ) { alert( 'Ajax call failed in CommitAddPartnerBox().' ); },
				onException: function ( request, e ) { alert( 'Exception during call to CommitAddPartnerBox().' ); throw e; }
			} );

	CloseAddPartnerBox();
}

function CloseAddPartnerBox()
{
	g_CustomIdBeingEdited = null;
	$( 'overlay' ).style.display = 'none';
	$( 'editBox' ).style.display = 'none';
}

admin.OnChangeReleaseDatePicker = function OnChangeReleaseDatePicker( field, e )
{
	var fixedReleaseDateRadioElement = document.getElementById( 'fixedReleaseDateRadio' );
	fixedReleaseDateRadioElement.checked = true;
}

function ScanElements( parentElement, tagName, arrayToFill )
{
	var inputElements = parentElement.getElementsByTagName( tagName );
	for ( var i = 0 ; i < inputElements.length ; ++i )
	{
		var inputElement = inputElements[ i ];
		var inputName = inputElement.name;
		if ( !inputName )
		{
			if ( inputElement.type != 'submit' )
			{
				console.log( "ScanElements() - Element of type " + inputElement.type + " with id '" + inputElement.id + "' does not have a name. Skip it." );
			}
			continue;		// If there is no name, there is no point passing this as parameter
		}
		if ( inputName == 'disabled' )
		{
			continue;		// If named disabled, on purpose, do not store it
		}
		var value = inputElement.value;
		if ( ( inputElement.type == 'radio' ) || ( inputElement.type == 'checkbox' ) )
		{
			if ( inputElement.checked != true )		// To handle side effect with potential null
			{
				continue;	// Not checked, we don't care about this value (otherwise it would override previously checked value)
			}
		}
		if ( ( value == null ) || ( value == undefined ) || ( value == '' ) )
		{
			continue;		// No point sending data that don't have any particular values
		}
		arrayToFill[ inputName ] = value;
	}
}

// Add StartsWith() on the string type (like C# version)
if ( !String.prototype.StartsWith )
{
	String.prototype.StartsWith = function (str)
	{
		// lastIndexOf starts at 0, and goes in reverse, thus it only checks the beginning of the string
		return ( this.lastIndexOf(str, 0) === 0 );
	}
}

function EscapeHTML( text )
{
	return text.replace( /&/g, "&amp;" )
				.replace( /</g, "&lt;" )
				.replace( />/g, "&gt;" )
				.replace( /"/g, "&quot;" )
				.replace( /'/g, "&#039;" );
}

// http://doc.infosnel.nl/javascript_trim.html
function trim( s )
{
	if ( ( s == null ) || ( s == undefined ) )
	{
		return s;
	}
	var l=0; var r=s.length -1;
	while(l < s.length && s[l] == ' ')
	{	l++; }
	while(r > l && s[r] == ' ')
	{	r--;	}
	return s.substring(l, r+1);
}

function CompareAppResults( thisApp1, thisApp2 )
{
	// First let's compare the types, sorted by lowest first
	if (thisApp1.app_type != thisApp2.app_type )
	{
		return thisApp1.app_type - thisApp2.app_type;
	}

	// Same type
	return thisApp2.appid - thisApp1.appid;		// Display the highest AppId first
												// As there is bigger chance that we want to see the recent Apps.
}

function IsNullOrEmptyString( text )
{
	if ( text == null )
	{
		return true;
	}
	if ( text == undefined )
	{
		return true;
	}
	if ( text == '' )
	{
		return true;
	}
	return false;
}

function GetPartnerNameText( thisApp )
{
	var textToDisplay = '';
	if ( thisApp.publishers && thisApp.publishers.length > 0 )
	{
		textToDisplay += "Publishers: ";
		for ( var i = 0; i < thisApp.publishers.length; ++i )
		{
			textToDisplay += ( i != 0 ? ', ' : '' ) + thisApp.publishers[i];
		}
	}
	if ( thisApp.store_publishers && thisApp.store_publishers.length > 0 )
	{
		if ( thisApp.publishers && thisApp.publishers.length > 0 )
		{
			textToDisplay += '<br>';
		}
		textToDisplay += "Store Publishers: ";
		for ( var i = 0; i < thisApp.store_publishers.length; ++i )
		{
			textToDisplay += ( i != 0 ? ', ' : '' ) + thisApp.store_publishers[i];
		}
	}

	return textToDisplay.length != 0 ? textToDisplay : "None set";
}

function MapTypeToText( type )
{
	switch ( type )
	{
		case 0: return "Invalid";
		case 1: return "Game";
		case 2: return "Application";
		case 4: return "Tool";
		case 8: return "Demo";
		case 16: return "Media";
		case 32: return "DLC";
		case 64: return "Guide";
		case 128: return "Driver";
		case 1073741824: return "Shortcut";
		case 2147483648: return "Depot";
		case 256: return "Config";
		case 512: return "Hardware";
		case 2048: return "Video";
		case 4096: return "Plugin";
		case 8192: return "Music";
		case 1024: return "Franchise";
		case 16384: return "Series";
		case 65536: return "Beta";
		default: return 'UNKNOWN: ' + type;
	}
}

admin.CreateDiv = function CreateDiv( parent, template, id, value, bText = false ) {
	var divElement = document.createElement( 'div' );
	divElement.id = id;
	divElement.style.styleFloat = 'left';							// Another cross-browser compatibility issue
	divElement.style.cssFloat = 'left';
	divElement.style.width = $( template ).style.width;				// Copy from the header for the moment
	if ( bText )
	{
		divElement.innerText = value;
	}
	else
	{
		divElement.innerHTML = value;									// Let's avoid innerText, and use innerHTML instead,
																	// it works cross-browser and will keep the <br/> tags
	}
	divElement.position = 'relative';
	parent.appendChild( divElement );
	return divElement;
};

function CreateBr( parentElement )
{
	var brElement = document.createElement( 'br' );
	brElement.style.clear = 'both';
	parentElement.appendChild(brElement);

}

var g_lastPrimarySearchSetTimeout = null;
var g_LastSecondarySearchSetTimeout = null;

var g_lastPrimarySearchRequest = null;
var g_LastSecondarySearchRequest = null;

var g_SendCommandAfterMs = 500;				// Send command after half a second

function CheckSendChangeAllCommand( elementSearch, elementPartnerSearch )
{
	// We set variables here, so the async version can check if the content changed between the last request
	// And cancel the Ajax query if the result is not relevant anymore...
	g_lastPrimarySearchSetTimeout = trim( elementSearch.value );
	if ( elementPartnerSearch )
	{
		g_LastSecondarySearchSetTimeout = trim( elementPartnerSearch.value );
	}
	else
	{
		g_LastSecondarySearchSetTimeout = '';
	}
	if ( ( g_lastPrimarySearchSetTimeout == '' ) && ( g_LastSecondarySearchSetTimeout == '' ) )
	{
		// Nothing to display, clear the result
		var resultsElement = $( 'results' );
		while ( resultsElement.hasChildNodes() )
		{
			resultsElement.removeChild( resultsElement.firstChild );
		}
		// Reset the previous request state, in case we simply copy and paste the previous search after emptying the buffer
		g_lastPrimarySearchRequest = null;
		g_LastSecondarySearchRequest = null;
		return false;
	}

	// We have to send the message
	return true;
}

// Code related to the allpackages page

function OnChangeAllApps( event )
{
	if ( CheckSendChangeAllCommand( $( 'appSearch' ), $( 'partnerSearch' ) ) == false )
	{
		return;
	}

	var eventObj = window.event ? window.event : event;	//distinguish between IE's explicit event object (window.event) and Firefox's implicit.
	var unicode = eventObj.charCode? eventObj.charCode : eventObj.keyCode;

	switch (unicode)
	{
		case 16:			// Shift - Is there
		case 17:			// Control
		case 18:			// Alt
		case 20:			// Caps-lock
		case 27: 			// Esc
		case 33:			// Page up
		case 34:			// Page down
		case 35:			// Home (verify)
		case 36:			// End (verify)
		case 37:			// Up (verify)
		case 38:			// Down (verify)
		case 39:			// left (verify)
		case 40:			// right (verify)
		case 45:			// insert
		case 91:			// Windows
		case 93:			// Context menu
			// These case are now certainly covered by the checks to avoid sending two times the same query
			// Skip arrows, home, end, shift, control, escape, windows, caps lock...
			// We could do the F1...F12, and others at a later point...
			return;
		case 9:
		case 13:
			// If tab or enter, we query directly
			OnChangeAllAppsAsync();
			break;
		default:
			window.setTimeout( 'OnChangeAllAppsAsync()', g_SendCommandAfterMs );
			break;
	}
}

function OnChangeAllAppsAsync()
{
	var appSearch = trim( $( 'appSearch' ).value );
	var partnerSearch = trim( $( 'partnerSearch' ).value );

	if ( ( appSearch == g_lastPrimarySearchRequest ) && ( partnerSearch == g_LastSecondarySearchRequest ) )
	{
		// We already sent the request, no need to send it again...
		//console.log( 'Already sent the request, skip it. ' + appSearch + "/" + partnerId );
		return;
	}
	if ( ( appSearch != g_lastPrimarySearchSetTimeout ) || ( partnerSearch != g_LastSecondarySearchSetTimeout ) )
	{
		// Since we received this request, we actually sent a new one that is more up-to-date, we can cancel this one...
		//console.log( 'Request is obsolete, skip it. ' + appSearch + "/" + partnerId );
		return;
	}

	g_lastPrimarySearchRequest = appSearch;
	g_LastSecondarySearchRequest = partnerSearch;

	if ( ( appSearch == '' ) && ( partnerSearch == '' ) )
	{
		// Reverted back to nothing, no need to send the request, it will fail
		return;
	}

	var parameters = { };
	var appId = parseInt( appSearch);
	if ( appSearch != '' )
	{
		if ( isNaN( appId ) )
		{
			parameters.appName = appSearch;
		}
		else
		{
			parameters.appId = appId;		// Could convert to integer, then we are looking it up as an appId
		}
	}
	parameters.partnerName = partnerSearch;

	new Ajax.Request( g_szBaseURL + '/admin/allappsqueryajax',
			{
				method:'get',
				requestHeaders: { 'Accept': 'application/json' },
				evalJSON: 'force',
				parameters: parameters,
				onSuccess: function(transport)
				{
					if ( ( appSearch != g_lastPrimarySearchSetTimeout ) || ( partnerSearch != g_LastSecondarySearchSetTimeout ) )
					{
						// After we sent this request, we actually sent a new one that is more up-to-date, we can cancel this one...
						//console.log( 'Request is obsolete, skip it. ' + appSearch + "/" + partnerId );
						return;
					}
					OnChangeAllAppsCallback( transport, parameters );
				},
				onFailure: function ( transport ) { alert( 'Ajax call failed in OnChangeAllApps().' ); },
				onException: function ( request, e ) { alert( 'Exception during call to OnChangeAllApps().' + e ); throw e; }
			} );
}

// Gets called when we get the search result from PHP.
// This is going to fill the UI with the results.
function OnChangeAllAppsCallback( transport, parameters )
{
	var response = transport.responseJSON
	if ( !response )
	{
		alert( "OnChangeAllAppsCallback() - No response: " + transport.responseText );
		return;
	}
	if ( response.success == false )
	{
		alert( "OnChangeAllAppsCallback() - Unsuccessful: " + response.result );
		return;
	}

	DisplayAllApps( response, $( 'results' ) );
}

function DisplayAllApps( response, resultsElement )
{
	var apps = response.result;
	apps.sort( CompareAppResults );

	// Before we add to the result, let's delete previous content.
	while ( resultsElement.hasChildNodes() )
	{
		resultsElement.removeChild( resultsElement.firstChild );
	}

	var numberOfResults = response.num_found;
	var resultText = numberOfResults == 0 ? 'No result found.' : "Displaying " + apps.length + " of " + numberOfResults + ' results ';
	$( 'resultsCount' ).update( resultText );

	// Note that we would probably want to sort by AppIds before displaying this
	for ( var i = 0 ; i < apps.length ; ++i )
	{
		var thisApp = apps[ i ];

		var color;		// Color will match the definition in styles_admin.css (.app_Movie, etc...)
		switch ( parseInt( thisApp.app_type ) )
		{
			case 1:	color = '#ffffff'; break;
			case 2:	color = '#ffffff'; break;
			case 4:	color = '#ffffff'; break;
			case 8: color = '#89c53f'; break;		// Demo
			case 32: color = '#a159a3'; break;		// DLC
			case 16:	color = '#6ba1bd'; break;		// Media
			case 64:	color = '#6ba1bd'; break;
			case 256:	color = '#6666FF'; break;
			case 65536: color = '#89c53f'; break;		// beta
			default:							color = '#ff0000';	break;		// If we don't recognize the type, let put a nice color :)
		}

		// First the application
		var applicationElement = document.createElement( 'div' );
		applicationElement.style.backgroundColor = '#333333';
		applicationElement.style.MarginTop = '4px';
		applicationElement.style.paddingTop = '4px';
		applicationElement.style.paddingBottom = '4px';
		resultsElement.appendChild( applicationElement );

		var appIdText = thisApp.appid;
		var appIdDiv = admin.CreateDiv( applicationElement, 'appIdHeader', 'appId', appIdText );
		appIdDiv.style.color = color;

		var appIdNameDiv = admin.CreateDiv( applicationElement, 'appNameHeader', 'appName', thisApp.name, true );
		appIdNameDiv.style.color = color;

		var partnerNameDiv = admin.CreateDiv( applicationElement, 'partnerNameHeader', 'partnerName', GetPartnerNameText( thisApp ) );
		partnerNameDiv.style.color = color;

		// store link
		var text = 'no';
		if ( thisApp.store_itemid )
		{
			var url = g_szBaseURL + '/admin/game/edit/' + thisApp.store_itemid;
			text = '<a href="' + url + '" target="_blank">edit</a>';
		}
		admin.CreateDiv( applicationElement, 'inStoreHeader', 'inStore', text );

		// steamworks link
		var url = g_szBaseURL + '/apps/landing/' + thisApp.appid;
		text = '<a href="' + url + '" target="_blank">edit</a>';
		admin.CreateDiv( applicationElement, 'inSteamworksHeader', 'inSteamworks', text );

		var typeDiv = admin.CreateDiv( applicationElement, 'typeHeader', 'type', MapTypeToText( parseInt( thisApp.app_type ) ) );
		typeDiv.style.color = color;

		url = g_szBaseURL + "/admin/allpackages?appId=" + thisApp.appid;
		var numPackages = thisApp.hasOwnProperty('subs') ? thisApp.subs.length : 0;
		if (numPackages == 0)
		{
			text = 'no packages';
		}
		else if (numPackages == 1)
		{
			text = '<a href="' + url + '" target="_blank">1 package</a>';
		}
		else
		{
			text = '<a href="' + url + '" target="_blank">' + numPackages + ' packages</a>';
		}
		admin.CreateDiv( applicationElement, 'packagesHeader', 'packages', text );

		CreateBr( applicationElement );

		var spacingElement = document.createElement( 'div' );
		spacingElement.style.marginTop = '4px';
		resultsElement.appendChild( spacingElement );
	}
}

function OnAppClick( depotId )
{
	$( depotId ).style.display = ( $( depotId ).style.display == '' ? 'none' : '' );
}

function TogglePackageInfoVisibility( element )
{
	for ( var sibling = element.next(); sibling && !sibling.hasClassName('PackageSection'); sibling = sibling.next() )
	{
		sibling.toggle();
	}
}
// Code related to the allpackages page

function OnChangeAllPackagesKeyEvent(event)
{
	var eventObj = window.event ? window.event : event;	//distinguish between IE's explicit event object (window.event) and Firefox's implicit.
	var unicode = eventObj.charCode? eventObj.charCode : eventObj.keyCode;

	switch (unicode)
	{
		case 16:			// Shift - Is there
		case 17:			// Control
		case 18:			// Alt
		case 20:			// Caps-lock
		case 27: 			// Esc
		case 33:			// Page up
		case 34:			// Page down
		case 35:			// Home (verify)
		case 36:			// End (verify)
		case 37:			// Up (verify)
		case 38:			// Down (verify)
		case 39:			// left (verify)
		case 40:			// right (verify)
		case 45:			// insert
		case 91:			// Windows
		case 93:			// Context menu
			// These case are now certainly covered by the checks to avoid sending two times the same query
			// Skip arrows, home, end, shift, control, escape, windows, caps lock...
			// We could do the F1...F12, and others at a later point...
			return;
		case 9:
		case 13:
			// If tab or enter, we query directly
			OnChangeAllPackages(true);
			break;
		default:
			OnChangeAllPackages(false);
			break;
	}

}

function OnChangeAllPackages(sendImmediately)
{
	if ( CheckSendChangeAllCommand( $( 'packageSearch' ), $( 'packageSearchByDepotId' ) ) == false )
	{
		return;
	}

	if (sendImmediately) {
		OnChangeAllPackagesAsync();
	} else {
		window.setTimeout( 'OnChangeAllPackagesAsync()', g_SendCommandAfterMs );
	}
}

function OnChangeAllPackagesAsync()
{
	$( 'errorText' ).update( '' );

	var packageSearch = trim( $( 'packageSearch' ).value );
	var depotIdSearch = trim( $( 'packageSearchByDepotId' ).value );

	if ( ( packageSearch == g_lastPrimarySearchRequest ) && ( depotIdSearch == g_LastSecondarySearchRequest ) )
	{
		// We already sent the request, no need to send it again...
		//console.log( 'Already sent the request, skip it. ' + packageSearch );
		return;
	}
	if ( ( packageSearch != g_lastPrimarySearchSetTimeout ) || ( depotIdSearch != g_LastSecondarySearchSetTimeout ) )
	{
		// Since we received this request, we actually sent a new one that is more up-to-date, we can cancel this one...
		//console.log( 'Request is obsolete, skip it. ' + packageSearch );
		return;
	}

	g_lastPrimarySearchRequest = packageSearch;
	g_LastSecondarySearchRequest = depotIdSearch;

	if ( ( packageSearch == '' ) && ( depotIdSearch == '' ) )
	{
		// Reverted back to nothing, no need to send the request, it will fail
		return;
	}

	var parameters = { };
	if ( packageSearch != '' )
	{
		var packageId = parseInt( packageSearch);
		if ( isNaN( packageId ) )
		{
			parameters.packageName = packageSearch;
		}
		else
		{
			parameters.packageId = packageId;		// Could convert to integer, then we are looking it up as a packageId
		}
	}

	if ( depotIdSearch != '' )
	{
		var depotId = parseInt( depotIdSearch );
		if ( isNaN( depotId ) )
		{
			// Not a number, we are not doing the search
			$( 'errorText' ).update( depotIdSearch + " can't be converted to an app or depot ID." );
			return;
		}
		else
		{
			parameters.depotId = depotId;
		}
	}

	parameters.output = 'html';         // We ask the PHP back-end to write the dynamic template for us
										// The message returned is bigger but there is less code to maintain

	new Ajax.Request( g_szBaseURL + '/admin/allpackagesqueryajax',
		{
			method:'get',
			requestHeaders: { 'Accept': 'application/json' },
			parameters: parameters,
			onSuccess: function(transport)
			{
				if ( ( packageSearch != g_lastPrimarySearchSetTimeout ) || ( depotIdSearch != g_LastSecondarySearchSetTimeout ) )
				{
					// After we sent this request, we actually sent a new one that is more up-to-date, we can cancel this one...
					//console.log( 'Request is obsolete, skip it. ' + partnerSearch );
					return;
				}
				$( 'results' ).innerHTML = transport.responseText;
			},
			onFailure: function ( transport ) { alert( 'Ajax call failed in OnChangeAllPackages().' ); },
			onException: function ( request, e ) { alert( 'Exception during call to OnChangeAllPackages().' + e ); throw e; }
		} );
}

function OnPackageClick( depotId )
{
	$( depotId ).style.display = ( $( depotId ).style.display == '' ? 'none' : '' );
}

function GoToLink( linkId )
{
	var link = $( linkId ).value;
	if ( link != '' )
	{
		window.location = link;
	}
}

function OnSavePackageAjax( bDupe, appitems )
{

	$( 'errorMessage' ).update( '' );
	$( 'savedMessage' ).update( 'Saving...' );

	// Let's get all the inputs directly from the page
	var formElement = document.getElementById( 'editPackage' );
	var parameters = {};
	ScanElements( formElement, 'input', parameters );
	ScanElements( formElement, 'select', parameters );
	ScanElements( formElement, 'textarea', parameters );
	parameters.appitems = Object.toJSON( appitems );
	parameters.sessionid = g_sessionID;

	// if we are creating a new package based on existing package
	if ( bDupe )
	{
		var r = confirm( "Are you sure you want to create a new package based on this?" );
		if ( r == false )
		{
			return;
		}

		parameters.packageid = -1;
		parameters.create_packages_only = true;

	}

	// let's do some checks here
	// appids and depotids can only contain digits and , (otherwise the parsing will fail in the back-end).
	if ( parameters.appids )
	{
		if ( /[^0123456789,]+/.test( parameters.appids ) )
		{
			$( 'errorMessage').update( 'appids does not have the proper syntax. No whitespaces are allowed. Example: "1,2,3,4".' );
			$( 'savedMessage').update( '' );
			return;
		}
	}

	if ( parameters.depotids )
	{
		if ( /[^0123456789,]+/.test( parameters.depotids ) )
		{
			$( 'errorMessage').update( 'depotids does not have the proper syntax. No whitespaces are allowed. Example: "1,2,3,4".' );
			$( 'savedMessage').update( '' );
			return;
		}
	}

	if ( parameters.startDepotAdd )
	{

		if ( /[^0123456789]+/.test( parameters.startDepotAdd ) )
		{
			$( 'errorMessage').update( 'Depot Range does not have the proper syntax. Integers only.' );
			$( 'savedMessage').update( '' );
			return;
		}


		if ( parameters.endDepotAdd )
		{
			if( /[^0123456789]+/.test( parameters.endDepotAdd ) )
			{
				$( 'errorMessage').update( 'Depot Range does not have the proper syntax. Integers only.' );
				$( 'savedMessage').update( '' );
				return;
			}

			if(parameters.startDepotAdd > parameters.endDepotAdd)
			{
				$( 'errorMessage').update( 'Start depot must be less than end depot.' );
				$( 'savedMessage').update( '' );
				return;

			}
		}

	}

	// Special case for package creation. In that case packageId is Not A Number
	if ( isNaN( parameters.packageid ) )
	{
		parameters.packageid = -1;
		parameters.create_packages_only = true;
	}


	// We Ajax the save so if it fails we are still on the same page and the user can modify the entry
	// It does not pollute the browser history either
	new Ajax.Request( g_szBaseURL + '/admin/savepackageajax',
		{
			method: 'post',
			requestHeaders: { 'Accept': 'application/json' },
			evalJSON: 'force',
			parameters: parameters,
			onSuccess: function(transport){	OnSaveCddbPackageCallback( transport );	},
			onFailure: function ( transport ) { alert( 'Ajax call failed in OnSavePackageAjax().' ); },
			onException: function ( request, e ) { alert( 'Exception during call to OnSavePackageAjax().' + e ); throw e; }
		} );
}

function OnSaveCddbPackageCallback( transport )
{
	var response = transport.responseJSON;
	if ( !response )
	{
		return;
	}
	if ( response.success )
	{
		$( 'errorMessage' ).update( '' );
		$( 'savedMessage' ).update( 'Package has been saved.');
		$( 'packageIdVisible' ).update( response.packageid );
		$( 'packageId').value = response.packageid;
		$( 'packageDisplay' ).update( response.newDisplay );

		if(response.startDepotAdd > 0)
		{
			$( 'depotRangeMessage').update(response.startDepotAdd + ' through ' + response.endDepotAdd + ' added.');
		}
		else
		{
			$( 'depotRangeMessage').update('');
		}


		$( 'revision' ).update( response.revision );
		$( 'last_modification_time' ).update( response.last_modification_time );
		$( 'submitInput' ).value = 'Apply Changes';
	}
	else
	{
		$( 'errorMessage' ).update( 'Package could not be saved. ' + response.error );
		$( 'savedMessage' ).update( '' );
		$( 'depotRangeMessage').update('');
	}
}

function ChangeCheckedState( parentElement, value )
{
	var inputElements = parentElement.getElementsByTagName( 'input' );
	for ( var i = 0 ; i < inputElements.length ; ++i )
	{
		var inputElement = inputElements[ i ];
		if ( inputElement.type == "checkbox" )
		{
			inputElement.checked = value;
		}
	}
}

function ActionOnPackages( parentElement, appIds, action )
{
	$( 'errorText').update( '' );
	$( 'packageActionStatusText' ).update( 'working...' );
	$( 'packageActionErrorText').update( '' );
	$( 'packageActionUpdateText').update( '' );
	$( 'addIdsButton' ).disable().addClassName('disabled');
	$( 'removeIdsButton' ).disable().addClassName('disabled');

	// Construct the string that list all the packages
	var allPackagesToUpdate = '';
	var inputElements = parentElement.getElementsByTagName( 'input' );
	var count = 0;
	for ( var i = 0 ; i < inputElements.length ; ++i )
	{
		var inputElement = inputElements[ i ];
		if ( ( inputElement.type == "checkbox" ) && inputElement.checked )
		{
			if ( allPackagesToUpdate != '' )
			{
				allPackagesToUpdate += ',';
			}
			allPackagesToUpdate += String( inputElement.value );
			count += 1;
		}
	}

	if ( count >= 10 )
	{
		var r = confirm( "Are you sure you want to modify " + count + " packages?" );
		if ( r == false )
		{
			return;
		}
	}

	// The inputs check is done by the PHP code.
	var parameters = {};
	parameters.packageidstoupdate = allPackagesToUpdate;
	parameters.appids = appIds;
	parameters.action = action;
	parameters.sessionid = g_sessionID;

	new Ajax.Request( g_szBaseURL + '/admin/actiononpackagesajax',
		{
			method: 'post',
			requestHeaders: { 'Accept': 'application/json' },
			evalJSON: 'force',
			parameters: parameters,
			onSuccess:  function(transport)
						{
							var response = transport.responseJSON;
							if ( response )
							{
								$( 'packageActionUpdateText').update( response.message_text );
								$( 'packageActionErrorText').update( response.error_text );
							}
							$( 'packageActionStatusText' ).update( '' );
							$( 'addIdsButton' ).enable().removeClassName('disabled');;
							$( 'removeIdsButton' ).enable().removeClassName('disabled');;
						},
			onFailure: function ( transport ) { alert( 'Ajax call failed in ActionOnPackages().' ); },
			onException: function ( request, e ) { alert( 'Exception during call to ActionOnPackages().' + e ); throw e; }
		} );
}

// updates allowed country hidden input fields
function UpdateAllowedCountries()
{
	var select = $( 'AllowedCountriesSelect' );
	var text = $( 'AllowedCountriesText' ).value;

	var hiddenAllowed = $('AllowedCountries_Hidden');
	var hiddenRestricted = $('RestrictedCountries_Hidden');

	if ( select.value == 'not' )
	{
		hiddenAllowed.value = '';
		hiddenRestricted.value = text;
	}
	else
	{
		hiddenAllowed.value = text;
		hiddenRestricted.value = '';
	}
}

//
// Localized text areas
//

// called when a localized text area selection box has changed
function OnLocLanguageSelect( id )
{
	var select = document.getElementById( id + '_select' );
	LocChangeLanguage( select.value );
}

// changes the localization language
function LocChangeLanguage( strLanguage )
{
	// update all PHP controls to the new language
	LocChangeControlsToLanguage( strLanguage );

	// tell react that the language changed
	window.dispatchEvent( new CustomEvent( "v_StoreAdminLanguageChange", { detail: { strLanguage: strLanguage } } ) );
}

function LocChangeControlsToLanguage( strLanguage )
{
	for ( var i = 0; i < g_LocSectionIDs.length; i++ )
		LocLanguageSelect( g_LocSectionIDs[i], strLanguage );
}

// global for registering all localized sections. Used to update all text area languages when one changes
var g_LocSectionIDs = [];
var g_bLocSetToEnglishOnLoad = false;
function LocListenForEvents( id, lang )
{
	g_LocSectionIDs.push( id );

	// fire an event to set all text entries to english on page load. Only do this once, and after
	// all enteries have registered for language change notifications (hence the setTimeout call below)
	if ( !g_bLocSetToEnglishOnLoad )
	{
		g_bLocSetToEnglishOnLoad = true;
		setTimeout( function(){ LocChangeLanguage( lang || 'english' ) }, 1 );
	}
}

// sets up text area for specific language
function LocLanguageSelect( id, language )
{
	var select = document.getElementById( id + '_select' );
	if ( select )
		select.value = language;

	var currentLang = document.getElementById( id + '_currentlanguage' );
	if ( currentLang )
		currentLang.value = language;

	var textArea = document.getElementById( id + '_textarea' );
	var hiddenInput = document.getElementById( id + language + '__hidden' );

	if ( textArea && hiddenInput ) {
		// Do a little dance to un-escape HTML entities in the hidden input (notably &amp;)
		var parsedVal = $J.parseHTML( hiddenInput.value.replace( /</g, '&lt;' ) );
		textArea.value = '';
		if ( parsedVal !== null )
		{
			for ( var i = 0; i < parsedVal.length; i++ )
				textArea.value += parsedVal[ i ].data;
		}

		// hint the language to the browser, which fixes rendering of some chinese characters among chinese/japanese
		textArea.setAttribute( "lang", hiddenInput.getAttribute( "lang" ) );
		textArea.dispatchEvent( new Event( 'input' ) );
	}
}

// called when localized text input changes. Updates hidden inputs
function OnLocTextChanged( id )
{
	var currentLanguage = document.getElementById( id + '_currentlanguage' ).value;
	if ( currentLanguage.length <= 0 )
		return;

	var textArea = document.getElementById( id + '_textarea' );
	var hiddenInput = document.getElementById( id + currentLanguage + '__hidden' );
	hiddenInput.value = textArea.value;
	$J( hiddenInput ).data( 'changed', true );
}

// called to set styles on text area select
function LocUpdateLangThatHaveText( id )
{
	var hiddenInputs = document.querySelectorAll( '#' + id + '_area input' );
	for ( var i = 0; i < hiddenInputs.length; i++ )
	{
		if ( hiddenInputs[i].id.indexOf( "_hidden" ) == -1 )
			continue;

		var idLanguage = hiddenInputs[i].id.slice( id.length );
		//remove the __hidden suffix at the end of this component to get the language
		idLanguage = idLanguage.slice( 0, idLanguage.indexOf( "__hidden" ) );
		var option = document.getElementById( id + idLanguage + '__option' );

		if ( option === null )
			continue;

		if ( hiddenInputs[i].value.length > 0 )
			option.classList.add( 'HasText' );
		else
			option.classList.remove( 'HasText' );
	}
}

function ShowAdditionalLanguage( selectId, selectValue )
{
	var langContainer = $( 'additional_language_' + selectValue );
	langContainer.style.display = 'block';

	var option = $( selectId + '_option_' + selectValue );
	option.style.display = 'none';
}

function OnAdditionalLanguageSelect( selectId )
{
	var select = $( selectId + '_select' );

	if ( select.value == '_none_' )
		return;

	ShowAdditionalLanguage( selectId, select.value );

	select.value = "_none_";
}

function OnClickShowAllAdditionalLanguages( selectId )
{
	var select = $J( '#' + selectId + '_select' );
	var children = select.children().each( function() {
		var optionValue = $J( this ).val();
		if ( optionValue == '_none_' )
			return;

		ShowAdditionalLanguage( selectId, optionValue );
	});
}

function SetAllLanguageCheck( checked )
{
	if ( checked )
	{
		$J( '.languages' ).find( '.checkboxGrid .setall a' ).each( function(){
			var a = $J( this );
			SetFancyCheckboxState( a.attr('id') , checked );
		});
	}
	else
	{
		$J( '.languages' ).find( '.checkboxGrid a' ).each( function(){
			var a = $J( this );
			SetFancyCheckboxState( a.attr('id') , checked );
		});
	}
}

function OnClickAllLanguages( selectId )
{
	OnClickShowAllAdditionalLanguages( selectId );
	SetAllLanguageCheck( true );
}

function OnClickNoLanguages( selectId )
{
	OnClickShowAllAdditionalLanguages( selectId );
	SetAllLanguageCheck( false );
}

function InferBBCodeInTextArea( id )
{
	// find text area
	var area = $( id + '_textarea' );
	window.originalHtmlAreaValue = area.value;
	area.value = InferBBCode( area.value );
	// Why?
	//jQuery("#app_content_about_default_preview").text( area.value );
	OnLocTextChanged( id );
}

function RevertInferedHtml( id, value )
{
	if ( window.originalHtmlAreaValue )
	{
		// find text area
		var area = $( id + '_textarea' );
		jQuery("#app_content_about_default_preview").html();
		area.value = window.originalHtmlAreaValue;
		OnLocTextChanged( id );
	}
}

function v_trim( str )
{
	if ( str.trim )
		return str.trim();
	else
	{
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
}

function RejectAppReleaseRequest( appid )
{
	var dialog = ShowPromptWithTextAreaDialog( 'Notes to send to the partner', '', null, null, 1000 );

	dialog.done( function( data ) {
		data = v_trim( data );
		if ( data.length < 1 )
		{
			ShowAlertDialog( 'Error', 'Please enter in some notes for the partner telling them what they need to do before their app can be released.' );
			return;
		}
		$J.post( 'https://partner.steamgames.com/admin/ajaxrejectappreleaserequest', {
				'sessionid' : g_sessionID,
				'appid' : appid,
				'notes_for_partner' : data
			}
		).done( function( json ) {
				top.location.reload();
			} );
	} );
}

// Register a callback to fire when our changes have been processed by the AI
function OnAIWaitComplete(func)
{
	var doCheck = function()
	{
		$J.ajax({
			url: "https://partner.steamgames.com/actions/waitforedits",
			type: "GET",
			dataType: "json"
		})
			.done(function( rgResult )
			{
				if( rgResult.wait_successful == 1 )
				{
					func();
				}
				else
				{
					// Try again in 500ms
					setTimeout(doCheck, 500);
				}
			})
			.fail(function( jqXHR, textStatus ) {
				alert( "Request failed: " + textStatus );
			});
	};
	doCheck();
}

function LoadPageClusterArchive( pageid, $Element, fnOnSuccess )
{
	$J.get( 'https://partner.steamgames.com/admin/store/clusterarchiveajax/' + pageid )
		.done( function( html ) {
			$Element.html( html );
			if ( fnOnSuccess )
				fnOnSuccess();
		} ).fail( function() {
			$Element.html( '<div style="color: red;">Failed to load history data</div>' );
		});
}

function ChangeLanguage( strTargetLanguage, bStayOnPage )
{
	var Modal = ShowBlockingWaitDialog( '更改语言', '' );
	$J.post( 'https://partner.steamgames.com/actions/setlanguage/', {language: strTargetLanguage, sessionid: g_sessionID })
	.done( function() {
		if ( bStayOnPage )
			Modal.Dismiss();
		else
		{
			if ( window.location.href.match( /[?&]l=/ ) )
				window.location = window.location.href.replace( /([?&])l=[^&]*&?/, '$1' );
			else
				window.location.reload();
		}
	}).fail( function() {
		Modal.Dismiss();
		ShowAlertDialog( '更改语言', '#text_game_error_generic' );
	});
}


function ShowAddBundleDialog()
{
	var dialog = ShowConfirmDialog( '创建新捆绑包', $J('#editBundleModal').show() , '创建新捆绑包' );

	var $Form = dialog.GetContent().find('form');
	dialog.SetRemoveContentOnDismissal( false );
	dialog.GetContent().css('width','640px');
	dialog.AdjustSizing();
	dialog.done( function() {
		var waitdialog = ShowBlockingWaitDialog( '创建新捆绑包', '正在保存更改…' );
		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/bundles/create/",
			data: $Form.serialize(),
			dataType: 'json'
		}).done(function( msg ) {
			if( msg.success == 1 )
			{
				window.location = 'https://partner.steamgames.com/bundles/view/' + msg.bundleid;
			}
			else
			{
				waitdialog.Dismiss();
				ShowAlertDialog("Bundle creation failed: " + (msg.error? msg.error : msg.success ) );
			}
		} ).fail( function() {
			waitdialog.Dismiss();
		});

	} );
}

function ShowAddGiveawayDialog()
{
	var dialog = ShowConfirmDialog( '创建新派送', $J('#editGiveawayModal').show() , '创建新派送' );

	var $Form = dialog.GetContent().find('form');
	dialog.SetRemoveContentOnDismissal( false );
	dialog.GetContent().css('width','640px');
	dialog.AdjustSizing();
	dialog.done( function() {
		var waitdialog = ShowBlockingWaitDialog( '创建新派送', '正在保存更改…' );
		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/giveaways/create/",
			data: $Form.serialize(),
			dataType: 'json',
			error: function( msg )
			{
				waitdialog.Dismiss();
				ShowAlertDialog('派送创建失败：', "保存更改失败" );
			},
			success: function( msg )
			{
				window.location = 'https://partner.steamgames.com/giveaways/edit/' + msg.giveaway_admin_id;
			},
		});
	} );
}

function ShowRenameInternalNameGiveawayDialog( giveawayAdminID )
{
	var dialog = ShowConfirmDialog( '修改现有派送', $J('#editGiveawayModal').show() , '修改现有派送' );

	var $Form = dialog.GetContent().find('form');
	dialog.SetRemoveContentOnDismissal( false );
	dialog.GetContent().css('width','640px');
	dialog.AdjustSizing();
	dialog.done( function() {
		var waitdialog = ShowBlockingWaitDialog( '修改现有派送', '正在保存更改…' );
		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/giveaways/alter/" + giveawayAdminID,
			data: $Form.serialize(),
			dataType: 'json',
			error: function( msg )
			{
				waitdialog.Dismiss();
				ShowAlertDialog('派送更新失败：', "保存更改失败" );
			},
			success: function( msg )
			{
				window.location = 'https://partner.steamgames.com/giveaways/edit/' + msg.giveaway_admin_id;
			},
		});
	} );
}


function ReloadGiveawayOverviewPage()
{
	// can't window.location.reload() beacuse we might be on one of the store admin actions (publish, save, etc)
	window.location = 'https://partner.steamgames.com/giveaways/';
}

// Remove the entire giveaway. This will no longer appear on the users list.
function RemoveGiveawayAdmin( giveawayname, giveawayid )
{
	var dialog = ShowConfirmDialog( "\t\t\u60a8\u786e\u5b9a\u5417\uff1f", "\u60a8\u786e\u5b9a\u8981\u53d6\u6d88\u6b64\u7a0b\u5e8f\u5305\u5956\u54c1\u5417\uff1f\uff08\u7a0b\u5e8f\u5305 ID\uff1a%1$s\uff09".replace('%1$s', giveawayname ) );
	dialog.done( function() {
		var dialogWait = ShowBlockingWaitDialog( "\u8bf7\u7a0d\u5019", "\u6b63\u5728\u79fb\u9664\u6d3e\u9001\u2026" );

		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/giveaways/remove/" + giveawayid,
			data: { 'sessionid' : g_sessionID },
			dataType: 'json',
			error: function( response )
			{
				dialogWait.Dismiss();
				ShowAlertDialog( "\u9519\u8bef", "\u79fb\u9664\u6d3e\u9001\u5931\u8d25\u3002\u8bf7\u8054\u7cfb\u5ba2\u670d" );
			},
			success: function( response ) { ReloadGiveawayOverviewPage(); },
		});
	} );
}

// Set the giveaway to a delete state, we are are permitted
function SetGiveawayToDeletedState( giveawayname, giveawayid )
{
	var dialog = ShowConfirmDialog( "\t\t\u60a8\u786e\u5b9a\u5417\uff1f", "\u5220\u9664\u6e38\u620f\u8d60\u9001\u201c%1$s\u201d\u3002\u5728\u5956\u9879\u516c\u5e03\u524d\u53ef\u4ee5\u6267\u884c\u8be5\u64cd\u4f5c\u3002\u4e00\u65e6\u5220\u9664\uff0c\u8be5\u8d60\u9001\u5728\u5408\u4f5c\u4f19\u4f34\u7ad9\u70b9\u5c06\u4e0d\u518d\u53ef\u89c1\uff08\u5b83\u4f1a\u6c38\u4e45\u6d88\u5931\uff09\u3002".replace('%1$s', giveawayname ) );
	dialog.done( function() {
		var dialogWait = ShowBlockingWaitDialog( "\u8bf7\u7a0d\u5019", "\u6b63\u5728\u79fb\u9664\u6d3e\u9001\u2026" );

		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/giveaways/clone/" + giveawayid,
			data: { 'sessionid' : g_sessionID },
			dataType: 'json',
			error: function( response )
			{
				dialogWait.Dismiss();
				ShowAlertDialog( "\u9519\u8bef", "\u590d\u5236\u5927\u6d3e\u9001\u5931\u8d25" );
			},
			success: function( response ) { ReloadGiveawayOverviewPage(); },
		});
	} );
}

// Duplicate the giveaway admin. If you own the giveaway then you get to keep the prizes. If it is cloning someone else, then you get an empty version.
function CloneGiveawayAdmin( giveawayname, giveawayid )
{
	var dialog = ShowConfirmDialog( "\t\t\u60a8\u786e\u5b9a\u5417\uff1f", "\u590d\u5236\u201c%1$s\u201d\u5e76\u521b\u5efa\u6b64\u5927\u6d3e\u9001\u7684\u5168\u65b0\u53ef\u7f16\u8f91\u7248\u672c\u3002".replace('%1$s', giveawayname ) );
	dialog.done( function() {
		var dialogWait = ShowBlockingWaitDialog( "\u8bf7\u7a0d\u5019", "\u6b63\u5728\u514b\u9686\u6d3e\u9001\u2026" );

		$J.ajax({
			type: "POST",
			url: "https://partner.steamgames.com/giveaways/clone/" + giveawayid,
			data: { 'sessionid' : g_sessionID },
			dataType: 'json',
			error: function( response )
			{
				dialogWait.Dismiss();
				ShowAlertDialog( "\u9519\u8bef", "\u590d\u5236\u5927\u6d3e\u9001\u5931\u8d25" );
			},
			success: function( response ) { ReloadGiveawayOverviewPage(); },
		});
	} );
}

function RegisterMultiLanguageAgreementIFrame( elContainer, strURL, rgLanguages, strCurrentLanguage )
{
	var elIFrame = $J('.agreement_frame', elContainer);
	var elSelect = $J('.agreement_select_container select', elContainer);
	var elLink = $J('.agreement_link', elContainer);

	elSelect.on('change', function( event ){
		elIFrame.attr('src', elSelect.val());
		elLink.attr('href', elSelect.val());
	});

	var strOptionValue = strURL + '&l=english';

	var nLanguages = 0;

	$J.each(rgLanguages, function(key, value)
	{
		nLanguages++;

		var elOption = document.createElement('option');
		elOption.innerText = value;
		elOption.value = strURL + '&l=' + key;
		elSelect.append( elOption );

		if( key == strCurrentLanguage )
			strOptionValue = elOption.value;

	});


	elSelect.val( strOptionValue );
	elSelect.trigger('change');

	if(nLanguages < 2 )
		elSelect.hide();
}

function ChangePrimaryPublisher()
{
	if ( !g_rgAllAffiliatedPublishers || !g_nPrimaryPublisher )
		return;

	var $dialogHTML = '<div class="dialog_change_partner_desc">您的 Steam 帐户为多个 Steamworks 机构的成员。<br>许多 Steamworks 功能只能基于您在当前选择的 Steamworks 机构范围内所具备的权限访问。<br>请从下方的下拉菜单中选择以进行切换：</div><form id="change_partner_form" ><select name="partnerid">';
	$J.each( g_rgAllAffiliatedPublishers, function( partnerID, strPartnerName ) {
		$dialogHTML += '<option' + ( ( g_nPrimaryPublisher == partnerID ) ? ' selected' : '' ) + ' value="' + parseInt( partnerID ) + '" >' + V_EscapeHTML( strPartnerName ) + '</option>';
	} );
	$dialogHTML += '</select>';

	var $dialog = ShowConfirmDialog( '切换 Steamworks 机构', $dialogHTML, '切换' );
	var $elNewPartnerID = $dialog.GetContent().find('#change_partner_form select');
	$dialog.done( function() {
		window.location = 'https://partner.steamgames.com/dashboard/?requestedPrimaryPublisher=' + $elNewPartnerID.val();
	} );
}

function CloseMailingAddressReminder()
{
	$J( '.address_reminder_ctn' ).slideUp();
	V_SetCookie( "hideEmailAddressReminder", 1, 30 ); // term email is misleading here
}

function RetireAppInternal( nAppID, nPubID, bDMCARetire, strNotes, strRetireAction, bRemoveCommunityPresence, bPurgeContent, bVerboseOutput )
{
	var Promise;
	var strRetireError = 'Unable to retire appID ';
	var strRetireSuccess = 'Successfully retired appID ';
	if ( !strRetireAction.localeCompare( 'Banned', undefined, { sensitivity: 'accent' }) )
	{
		strRetireError = 'Unable to ban appID';
		strRetireSuccess = 'Successfully banned appID ';
	}
	else if ( !strRetireAction.localeCompare( 'DMCA', undefined, { sensitivity: 'accent' }) )
	{
		strRetireError = 'Unable to DMCA retire appID';
		strRetireSuccess = 'Successfully DMCA retired appID ';
	}

	var progressMessages = $J( '#ProgressMessagesContainer' );

	Promise = $J.post( 'https://partner.steamgames.com/apps/retireapp/' + nAppID, {
		notes: strNotes,
		partnerid: nPubID,
		retireaction: strRetireAction,
		dmcaretire: bDMCARetire ? 1 : 0,
		remove_community_presence: bRemoveCommunityPresence ? 1 : 0,
		purge_content: bPurgeContent ? 1 : 0,
		sessionid: g_sessionID
	}).fail( function( xhr ) {
		progressMessages.append( '<div class="add_dlc_error_msg">' + strRetireError + nAppID + '</div>' );
	}).done( function( response ) {
		if ( response.success == 1 )
		{
			progressMessages.append( '<div class="add_dlc_msg parent">' + strRetireSuccess + nAppID + '</div>' );
		}
		else
		{
			progressMessages.append( '<div class="add_dlc_msg parent">' + '</div>' );
			progressMessages.append( '<div class="add_dlc_error_msg">' + 'Error with appID ' + nAppID + '</div>' );
			if ( response.msg_errors )
			{
				for ( var i = 0; i < response.msg_errors.length; i++ )
				{
					progressMessages.append( '<div class="add_dlc_error_msg">' + response.msg_errors[i] + '</div>' );
				}
			}
			else
			{
				progressMessages.append( '<div class="add_dlc_error_msg">' + response + '</div>' );
			}
		}
	}).always( function( response ) {
		if ( bVerboseOutput )
		{
			if ( response.msg_success )
			{
				for ( var i = 0; i < response.msg_success.length; i++ )
				{
					progressMessages.append( '<div class="add_dlc_msg">' + response.msg_success[i] + '</div>' );
				}
			}

			progressMessages.append( '<div class="add_dlc_msg">' + 'Finished appID ' + nAppID + '</div>' );
		}
	});

	return Promise;
}



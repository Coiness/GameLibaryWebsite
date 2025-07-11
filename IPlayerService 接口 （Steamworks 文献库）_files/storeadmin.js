
function UpdateMetacriticLink( name, metacritic )
{
	var elemMetacritic = $(metacritic);
	if ( g_rgMetacriticURLs && g_rgMetacriticURLs[name] )
	{
		elemMetacritic.href = g_rgMetacriticURLs[name];
		elemMetacritic.show();
	}
	else
	{
		elemMetacritic.hide();
	}
}

function OnBlurMetacritic( name )
{
	if ( g_rgMetacriticURLs && g_rgMetacriticURLs[name] )
		return;

	// invalid metacritic name.. clear
	$( 'app_game_metacritic_metacritic_name__target' ).value = '';
	$( 'app_game_metacritic_metacritic_name__compl' ).value = '';
	UpdateMetacriticLink( '', 'metacritic_link' );

}

function UpdateAdminLink( elem, urlpath, value )
{
	var elemLink = $(elem);
	if ( value )
	{
		elemLink.href = g_szBaseUrl  + urlpath + value;
		elemLink.show();
	}
	else
	{
		elemLink.hide();
	}
}

function OnFreeGameCheck( checkbox, appid )
{
	if ( checkbox.value )
	{
		$('alt_appid_input').value = appid;

		// If f2p genre checkbox is unchecked, check it.
		if ( !$( 'checkbox_rgGenres_37__input' ).value )
		{
			ToggleCheckbox( 'checkbox_rgGenres_37_' );
		}

		// Set primary genre to f2p.
		$( 'primary_genre_select' ).value = 37;

		new Effect.BlindDown( 'free_game_settings', {duration: 0.25} );
	}
	else
	{
		$('alt_appid_input').value = '';

        // If f2p genre checkbox is checked, uncheck it.
		if ( $( 'checkbox_rgGenres_37__input' ).value )
		{
			ToggleCheckbox( 'checkbox_rgGenres_37_' );
		}

		new Effect.BlindUp( 'free_game_settings', {duration: 0.25} );
	}
}

function PopulatePackageAppLists( rgIncludedItemIds, bDisabled )
{
	var elemAllApps = $('package_available_app_list');
	var elemIncludedApps = $('package_included_app_list');

	for ( var i = 0; i < rgIncludedItemIds.length; i++ )
	{
		var itemId = rgIncludedItemIds[i];
		var rgItemData = g_rgReferencedItems[itemId] || {};
		var attrs = {value: itemId, 'class': rgItemData['cssClass'] + ' app_list_option'};
		if ( bDisabled ) {
			attrs.disabled = true;
		}
		var opt = new Element('option', attrs );
		opt.innerHTML = rgItemData['name'] || ( '{unknown item ' + itemId + '}' );
		elemIncludedApps.appendChild(opt);
	}
}

var g_rgstrLastSearch = "";
var g_nFindPackageTimer = 0;
function PopulatePackageListsAJAX( elemAutoCompleteName, elemListName, bStorePackagesOnly )
{
	if ( g_nFindPackageTimer )
		window.clearTimeout( g_nFindPackageTimer );

	g_nFindPackageTimer = setTimeout( function() {
		var matchText = $J( "#" + elemAutoCompleteName ).val();

		if ( matchText.length < 3 )
			return;

		if ( g_rgstrLastSearch != matchText )
		{
			g_rgstrLastSearch = matchText;
		}

		var params = {
			term : matchText,
			sessionid: g_sessionID
		};
		if ( bStorePackagesOnly )
			params['store_packages_only'] = 1;

		new Ajax.Request( 'https://partner.steamgames.com/admin/store/suggestpackagejson/', {
			method: 'post',
			parameters: params,
			onSuccess: function( transport ) {
				if ( g_rgstrLastSearch != matchText )
					return;
				var matchingItems = transport.responseJSON || [];
				var list = $J( "#" + elemListName );
				list.find("option").remove();
				for ( var i = 0; i < matchingItems.length; ++i )
				{
					var option = matchingItems[i];
					var name = option['name'];
					if ( option['notes'] )
					{
						name += " [" + option['notes'] + "]";
					}
					list.append( $J('<option>', { 'class' : option['cssClass'], value : option['packageid'], text : name } ) );
				}
			}
		} );
	} );
}

function PopulateItemListAJAX( elemAutoCompleteName, elemListName, packageCollection, grantor )
{
	var matchText = $J( "#" + elemAutoCompleteName ).val();

	if ( matchText.length < 1 )
		return;

	var params = {
		term : matchText,
		sessionid: g_sessionID,
		max_suggestions: 100
	};
	new Ajax.Request( 'https://partner.steamgames.com/admin/store/suggestitemjson/', {
		method: 'post',
		parameters: params,
		onSuccess: function( transport ) {
			var matchingItems = transport.responseJSON || [];
			var list = $J( "#" + elemListName );
			list.find("option").remove();
			for ( var i = 0; i < matchingItems.length; ++i )
			{
				var option = matchingItems[i];
				var name = option['name'];
				if ( option['notes'] )
				{
					name += " [" + option['notes'] + "]";
				}
				list.append( $J('<option>', { 'class' : option['cssClass'], value : option['itemid'], text : name } ) );
			}
		}
	} );
}
function AjaxChangeClusterFilter( strMatchTag, elemListID, clusterName, clusterType, bShowDLC )
{
	if( strMatchTag == undefined || strMatchTag.length < 1 )
		return;

	var params = {
		tag : strMatchTag,
		showdlc : bShowDLC,
		type : clusterType,
		sessionid: g_sessionID
	}
	new Ajax.Request( 'https://partner.steamgames.com/admin/store/gettaggedpackages/', {
		method: 'post',
		parameters: params,
		onSuccess: function( transport ) {
			var matchingItems = transport.responseJSON || [];
			var list = $J( "#" + elemListID );
			list.find("div").remove();
			for ( var i = 0; i < matchingItems.length; ++i )
			{
				var option = matchingItems[i];
				var name = option['name'];

				var newElement = null;
				if ( option['packageid'] )
				{
					newElement = $J('<div/>', {id: clusterName + '_clusterpackage_' + option['packageid'], 'class': option['cssClass'], text : name } );
				}
				else if ( option['itemid'] )
				{
					newElement = $J('<div/>', {id: clusterName + '_clusteritem_' + option['itemid'], 'class': option['cssClass'], text : name } );
				}
				if ( newElement )
				{
					list.append( newElement );
				}
			}
		}
	} );
}
function AjaxPopulateClusterList( elemValue, elemListID, clusterName, clusterType )
{
	var matchText = elemValue;

	var params = {
		term : matchText,
		type : clusterType,
		sessionid: g_sessionID,
		max_suggestions: 100
	};
	new Ajax.Request( 'https://partner.steamgames.com/admin/store/suggestclusteritemsjson/', {
		method: 'post',
		parameters: params,
		onSuccess: function( transport ) {
			var matchingItems = transport.responseJSON || [];
			var list = $J( "#" + elemListID );
			list.find("div").remove();
			for ( var i = 0; i < matchingItems.length; ++i )
			{
				var option = matchingItems[i];
				var name = option['name'];

				var newElement = null;
				if ( option['packageid'] )
				{
					newElement = $J('<div/>', {id: clusterName + '_clusterpackage_' + option['packageid'], 'class': option['cssClass'], text : name } );
				}
				else if ( option['itemid'] )
				{
					newElement = $J('<div/>', {id: clusterName + '_clusteritem_' + option['itemid'], 'class': option['cssClass'], text : name } );
				}
				else if ( option['bundleid'] )
				{
					newElement = $J('<div/>', {id: clusterName + '_clusterbundle_' + option['bundleid'], 'class': option['cssClass'], text : name } );
				}
				if ( newElement )
				{
					list.append( newElement );
				}
			}
		}
	} );
}

function UpdateClusterCount( elemIncludedApps, clusterName )
{
	const nCapsules = $J( elemIncludedApps ).children( "div" ).length;

	let strHeader = "Capsules in this cluster";
	if ( nCapsules > 0 )
	{
		strHeader = "%d Capsules in this cluster".replace( "%d", nCapsules );
	}

	$J( '#cluster_' + clusterName + '_header' ).text( strHeader );
}

// Populates the included list with solr itemids given a list of appids
function PopulateClusterViaAppIDs( elemAppIDTextArea, elIncludedList, clusterName )
{
	$J( '#appids_' + clusterName + '_area' ).slideUp();

	const rgAppIDs = elemAppIDTextArea.val().split( '\n' );

	if ( rgAppIDs.length < 1 || elemAppIDTextArea.val().length < 1 )
		return;

	$J( '#appids_' + clusterName + '_area' ).slideUp();
	$J.post( 'https://partner.steamgames.com/admin/store/importappidsjson/', { 'sessionid': g_sessionID, 'appids': rgAppIDs } ).done( function( rgApps )
	{
		let rgAppRows = [];
		for ( let i = 0; i < rgApps.length; ++i )
		{
			var option = rgApps[i];
			var name = option['name'];

			rgAppRows.push(  $J('<div/>', {id: clusterName + '_clusteritem_' + option['itemid'], 'class': option['cssClass'], text : name } ) );
		}

		elIncludedList.append( rgAppRows );
		elIncludedList.trigger("change");
		elemAppIDTextArea.val( "" );
	} );

}

// Opens a dialog that outputs all of the appids/packageids/bindleids for a given cluster
function ExportClusterItemsList( strClusterName )
{
	const $elCluster = $J( '#cluster_' + strClusterName + '_included' );
	const $rgChildren = $elCluster.children( 'div' );

	let rgAppIDs = [];
	let rgBundles = [];
	let rgPackages = [];
	$rgChildren.each( function( id, elItem ) {
		const appID = $J( elItem ).data( 'appid' );
		if ( appID )
			rgAppIDs.push( appID );

		const bundleID = $J( elItem ).data( 'bundleid' );
		if ( bundleID )
			rgBundles.push( bundleID );

		const packageID = $J( elItem ).data( 'packageid' );
		if ( packageID )
			rgPackages.push( packageID );
	} );

	let outputHTML = '';
	if ( rgAppIDs.length > 0 )
		outputHTML += '<div class="formrow">AppIDs:</div><textarea rows="10" readonly>' + rgAppIDs.join( '\n' ) + '</textarea>';

	if ( rgPackages.length > 0 )
		outputHTML += '<div class="formrow">PackageIDs:</div><textarea rows="10" readonly>' + rgPackages.join( '\n' ) + '</textarea>';

	if ( rgBundles.length > 0 )
		outputHTML += '<div class="formrow">BundleIDs:</div><textarea rows="10" readonly>' + rgBundles.join( '\n' ) + '</textarea>';

	ShowAlertDialog( 'Export ' + strClusterName + ' Cluster', outputHTML );
}

function PopulateClusterLists( rgIncludedItems, clusterName, elemAvailableList, elemIncludedList, clusterType )
{
	var elemAllApps = $(elemAvailableList);
	var elemIncludedApps = $(elemIncludedList);

	var rgIncludedItemIds = {};
	var rgIncludedPackageIds = {};
	if ( rgIncludedItems )
	{
		rgIncludedItems.each( function ( rgItem ) {
			if ( rgItem.itemid )
				rgIncludedItemIds[ rgItem.itemid ] = true;
			else if ( rgItem.packageid )
				rgIncludedPackageIds[ rgItem.packageid ] = true;
		} );
	}

	$J(elemAllApps).on( 'dblclick', MoveClusterItem.bind( null, elemAllApps, elemIncludedApps, true ) )
	$J(elemIncludedApps).on( 'dblclick', MoveClusterItem.bind( null, elemAllApps, elemIncludedApps, false ) )
	$J(elemIncludedApps).change( UpdateClusterCount.bind( null, elemIncludedApps, clusterName ) );

	Event.observe( elemAllApps.up('form'), 'submit', SerializeClusterToForm.bindAsEventListener( null, elemAllApps.up('form'), 'capsule_lists[' + clusterName + ']', elemIncludedApps ) );

	// is the list of included apps an empty array?
	if ( !rgIncludedItems || rgIncludedItems.length == 0 )
		return;
	for ( var i = 0; i < rgIncludedItems.length; i++ )
	{
		var rgItem = rgIncludedItems[i];
		if ( rgItem.itemid )
		{
			var opt = new Element('div', {id: clusterName + '_clusteritem_' + rgItem.itemid, 'class': g_rgReferencedItems[rgItem.itemid]['cssClass'], 'data-appid': rgItem.appid ?? 0 } );
			opt.innerHTML = g_rgReferencedItems[rgItem.itemid]['name'];
			elemIncludedApps.appendChild(opt);
		}
		else if ( rgItem.packageid )
		{
			var opt = new Element('div', {id: clusterName + '_clusterpackage_' + rgItem.packageid, 'class': 'app_Package', 'data-packageid': rgItem.packageid ?? 0  } );
			opt.innerHTML = g_rgReferencedPackages[rgItem.packageid];
			elemIncludedApps.appendChild(opt);
		}
		else if ( rgItem.bundleid )
		{
			var opt = new Element('div', {id: clusterName + '_clusterbundle_' + rgItem.bundleid, 'class': 'app_Package','data-bundleid': rgItem.bundleid ?? 0 } );
			opt.innerHTML = g_rgReferencedBundles[rgItem.bundleid];
			elemIncludedApps.appendChild(opt);
		}
	}

	CreateClusterSortable( elemIncludedApps );
}

function SerializeClusterToForm( event, form, inputName, elemIncludedApps )
{
	var rgItems = GetClusterItemsAsArray( elemIncludedApps );
	var value = Object.toJSON( rgItems );
	form.appendChild( new Element( 'input', {type: 'hidden', value: value, name: inputName } ) );
	return true;
}

function GetClusterItemsAsArray( elemIncludedApps )
{
	var rgItems = [];
	elemIncludedApps.childElements().each( function( e ) {
		var id = e.id;
		var rgMatch = id.match( /cluster(item|package|bundle)_([0-9]*)/ );
		if ( rgMatch )
		{
			if ( rgMatch[1] == 'item' )
				rgItems.push( { itemid: rgMatch[2] } );
			else if ( rgMatch[1] == 'package' )
				rgItems.push( { packageid: rgMatch[2] } );
			else if ( rgMatch[1] == 'bundle' )
				rgItems.push( { bundleid: rgMatch[2] } );
		}
	});
	return rgItems;
}

function MoveClusterItem( elemAvailable, elemIncluded, bAdding, event )
{
	var elemFrom = bAdding ? $(elemAvailable) : $(elemIncluded);
	var elemTo = bAdding ? $(elemIncluded) : $(elemAvailable);
	var elem = event.target;

	if ( elem && $J.contains( elemFrom, elem ) )
	{
		$J(elemTo).append( $J(elem).detach() );
	}
	CreateClusterSortable( elemIncluded );
}

function MoveAll( elSrc, elDest )
{
	$J.each(elSrc.children(), function(i, j) {
		elDest.append( $J(j).detach() );
	});
	CreateClusterSortable( elDest[0] );
}

function CreateClusterSortable( elem )
{
	Sortable.destroy( elem );
	Position.includeScrollOffsets = true;
	Sortable.create( elem, {tag: 'div', scroll: $(elem).up('.appselect_list_ctn') } );
	$J( elem ).trigger("change");
}

function PreviewCapsules( strSize, elemIncluded )
{
	var rgItems = GetClusterItemsAsArray( $(elemIncluded) );

	var url = g_szBaseUrl + '/admin/store/pagecapsulepreview/?';
	url += Object.toQueryString( { strCapsuleJSON: Object.toJSON( rgItems ), strCapsuleSize: strSize } );

	var win = window.open(url,'capsule_preview','height=584,width=724,resize=yes,scrollbars=yes');
	win.focus();
}

function MovePackageApp( from, to )
{
	var elemFrom = $(from);
	var elemTo = $(to);
	var valuesMoved = null;

/*
 * This code works well for single selection, not multi-selection
	if ( elemFrom.selectedIndex >= 0 )
	{
		var opt = $(elemFrom.options[elemFrom.selectedIndex]);
		elemTo.appendChild( opt.remove() );
	}
*/
	// Here is the multi-selection friendly (will be slower than above in case there are many items).
	for ( var i = 0; i < elemFrom.options.length ; )
	{
		var opt = elemFrom.options[i];
		if ( opt.selected )
		{
			elemTo.appendChild( opt.remove() );
			// If we move from one to the other, we are actually not increasing the counter,
			// otherwise we would skip the test for the next item (it would have the same index as the current index).
			if ( valuesMoved == null )
			{
				valuesMoved = {};
			}
			valuesMoved[ opt.value ] = true;
		}
		else
		{
			++i;
		}
	}
	return valuesMoved;
}


function UpdateExtendedKV( form, packageid )
{
	var $Form = $( form );
	$J.ajax({ type:'POST',
			url:'https://partner.steamgames.com/store/updatereleaseoverridekv/' + packageid,
				data: $Form.serialize(),
			async: false
			});
}


function BuildPackageAppList( form )
{
	var elemIncludedApps = $('package_included_app_list');
	var strAppList = '';
	var bFirst = true;
	for ( var i = 0; i < elemIncludedApps.options.length; i++ )
	{
		if ( !bFirst )
			strAppList += ',';
		else
			bFirst = false;
		strAppList += elemIncludedApps.options[i].value;
	}

	form.appendChild( new Element( 'input', {type: 'hidden', name: 'package_included_apps', value: strAppList } ) );

	return true;
}

var lastFilters = new Object();
function FilterList( target, str )
{
	if( Prototype.Browser.Gecko ||  $(target).tagName == "DIV" )
		return FilterListFast( target, str );

	// @note Tom Bui: this doesn't work at all for contracting, since we don't just filter apps with this function anymore

	var lastFilter = lastFilters[target];
	if ( !lastFilter )
		lastFilter = '';

	str = str.toLowerCase();
	if ( str == lastFilter )
		return false;

	var expanding = false;
	var contracting = false;
	if ( str.length > lastFilter.length && str.startsWith( lastFilter ) )
		expanding = true;
	if ( !str || str.length < lastFilter.length && lastFilter.startsWith( str ) )
		contracting = true;

	var strParts = str.split(/\W/);

	var elemTarget = $(target);
	var elemParent = elemTarget.parentNode;
	elemParent.removeChild( elemTarget );

	rgChildren = elemTarget.childElements();

	for ( var i = 0; i < rgChildren.length; i++ )
	{
		var child = rgChildren[i];
		//if ( child.nodeType != child.ELEMENT_NODE )
		//	continue;

		if ( !child.lcText )
			child.lcText = (child.innerText || child.textContent).toLowerCase();

		var text = child.lcText;
		var show = true;
		for ( var iPart = 0; show && iPart < strParts.length; iPart++ )
			if ( !text.include( strParts[iPart] ) )
				show=false;

		if ( !show )
			elemTarget.removeChild( child );
	}

	lastFilters[target] = str;
	elemParent.appendChild( elemTarget );
	return true;
}

function FilterListFast( target, str )
{
	var lastFilter = lastFilters[target];
	if ( !lastFilter )
		lastFilter = '';

	str = str.toLowerCase();
	if ( str == lastFilter )
		return false;

	var expanding = false;
	var contracting = false;
	if ( str.length > lastFilter.length && str.startsWith( lastFilter ) )
		expanding = true;
	if ( !str || str.length < lastFilter.length && lastFilter.startsWith( str ) )
		contracting = true;

	var strParts = str.split(/\W/);

	var elemTarget = $(target);
	var elemParent = elemTarget.parentNode;
	elemParent.removeChild( elemTarget );

	var rgChildren = elemTarget.childNodes;
	for ( var i = 0; i < rgChildren.length; i++ )
	{
		var child = rgChildren[i];
		if ( child.nodeType != child.ELEMENT_NODE )
			continue;
		if ( expanding && child.style.display=='none' || contracting && child.style.display != 'none' )
			continue;
		if ( !child.lcText )
			child.lcText = (child.innerText || child.textContent).toLowerCase();

		var text = child.lcText;
		var show = true;
		for ( var iPart = 0; show && iPart < strParts.length; iPart++ )
			if ( !text.include( strParts[iPart] ) )
				show=false;

		if ( show )
			child.style.display = '';
		else
			child.style.display = 'none';
	}
	lastFilters[target] = str;
	elemParent.appendChild( elemTarget );
	return true;
}

function ImageHoverPreview( event, divHover, url )
{
	if (!event) var event = window.event;

	var hover = $(divHover);
	if ( hover.parentNode != document.documentElement )
	{
		document.documentElement.appendChild( hover.remove() );
	}
	if ( !hover.visible() || hover.hiding )
	{
		hover.hiding = false;
		if ( hover.effect ) hover.effect.cancel();
		hover.effect = Effect.Appear( hover, {duration: 0.2} );
	}
	hover.style.left = event.pageX + 10 + 'px';
	hover.style.top = event.pageY + 20 + 'px';
	hover.down('img').src = url;
}

function HideImageHover( event, divHover, elem )
{
	if (!event) var event = window.event;
	var reltarget = (event.relatedTarget) ? event.relatedTarget : event.toElement;
	if ( reltarget && ( $(reltarget).up( '#' + elem.identify() ) /* || $(reltarget).up( '#' + divHover.id ) */ ) )
		return;

	var hover = $(divHover);
	if ( hover.effect ) hover.effect.cancel();
	if ( hover.visible() )
	{
		hover.effect = Effect.Fade( hover, {duration: 0.2} );
		hover.hiding = true;
	}
}

function FlushStoreHome( elemStatus )
{
	$(elemStatus).update( 'Flushing the home page now...' );

	new Ajax.Updater(
			elemStatus,
			g_szBaseUrl + '/admin/store/flushstorehome',
			{ parameters: { sessionid: g_sessionID } } );
}

function OnGenreSelect( checkbox, id, name )
{
	var elemPrimary = $('primary_genre_select');
	if ( checkbox.value )
	{
		var elemOpt = new Element( 'option', { value: id } );
		elemOpt.update( name );
		elemPrimary.appendChild( elemOpt );

		if ( !elemPrimary.value )
			elemPrimary.value = id;
	}
	else
	{
		var bWasSelected = (elemPrimary.value == id);
		var elemOpt = null;
		for ( var i = 0; i < elemPrimary.options.length && !elemOpt; i++ )
		{
			if ( elemPrimary.options[i].value == id )
				elemOpt = elemPrimary.options[i];
		}
		if ( elemOpt )
		{
			elemPrimary.removeChild( elemOpt );
			if ( bWasSelected )
			{
				elemPrimary.value = elemPrimary.options[ elemPrimary.options.length > 1 ? 1 : 0 ].value;
			}
		}
	}
}

function MoveSelectItemUp( element )
{
	var list = $( element );
	var options = list.select('option');

	for ( var i = 1; i < options.length; i++ )
	{
		var o = options[i];

		if ( o.selected )
		{
			list.removeChild( o );
			list.insertBefore( o, options[ i - 1 ] );
		}
	}
}

function MoveSelectItemDown( element )
{
	var list = $( element );
	var options = list.select('option');

	for ( var i = options.length - 2; i >= 0; i-- )
	{
		var o = options[i];

		if ( o.selected )
		{
			var nextOpt = options[i + 1];
			o = list.removeChild(o);
			nextOpt = list.replaceChild(o, nextOpt);
			list.insertBefore(nextOpt, o);
		}
	}
}

function ReenableSubmitInput( matchingValue, newValue )
{
	var inputElements = document.getElementsByTagName( 'input' );
	for ( var i = 0 ; i < inputElements.length ; ++i )
	{
		var inputElement = inputElements[ i ];
		if ( inputElement.type != 'submit' )
		{
			continue;		// Only interested in 'submit' elements
		}
		if ( inputElement.value != matchingValue )
		{
			continue;		// No point sending data that don't have any particular values
		}
		inputElement.value = newValue;
		inputElement.disabled = null;
	}
}

function AddTagToApp( nAppId, strTag, nTagId)
{
	if( !nTagId || !nAppId || !strTag )
		return;

	$J('#TagAddBtn').prop("disabled",true);
	$J.ajax({
		type: "POST",
		url: "https://partner.steamgames.com/apps/ajaxaddtag/" + nAppId,
		data: { tagid: nTagId, tag:strTag, appid: nAppId, sessionid: g_sessionID },
		dataType: "json"
	})
	.done(function( msg ) {

			$J('#TagList').append( $J('<li>').text(strTag) );
			$J('#tag_completer_target').val('');
			$J('#tag_completer_compl').val('');
			$J('#TagAddBtn').prop("disabled",false);

			if( $J('#TagList li').length >= 5 ) {
				$J('#AddTagDiv').hide();
			}
	});
}

function UpdateButtonGroup(key)
{
	var radioValue = $J('input:radio[name='+key+'_radio]:checked').val();
	$J('.'+key+'_input').val('');
	$J('#'+key+'_input_' + radioValue).val(true);
}


function UpdateButtonGroupValue(key)
{
	var radioValue = $J('input:radio[name='+key+'_radio]:checked').val();
	$J('#'+key+'_input').val(radioValue);
	MarkSentinal(key); // If we have one.
}

function MarkSentinal(key)
{
	$J('#'+key+'_sentinel').val("1");
}

function IsNumberKey( evt )
{
	var charCode = (evt.which) ? evt.which : event.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}

function SetFreeToPlay( appid, packageid )
{
	var dialog = ShowConfirmDialog( "\u6309\u9700\u514d\u8d39\u7a0b\u5e8f\u5305", "\u60a8\u7684\u7a0b\u5e8f\u5305\u5c06\u88ab\u8bbe\u7f6e\u4e3a\u514d\u8d39\u3002\u60a8\u786e\u5b9a\u8981\u7ee7\u7eed\u5417\uff1f<br><br>\u9009\u62e9\u76f8\u5e94\u7684\u8d2d\u4e70\u6587\u5b57\uff1a" );
	var input = dialog.m_$Content.find( 'input' );
	input.val( '#genre_free2play' );
	input.select();

	//var buttons = dialog.m_$Content.
	$J('<select><option value="#PurchaseButton_FreeToPlay">免费开玩</option><option value="#PurchaseButton_Free">免费</option></select>')
		.insertBefore( dialog.m_$Content.find('.newmodal_buttons') );

	//dialog.m_$Content.append(  );
	var select = dialog.m_$Content.find( 'select' );
	select.val( '#PurchaseButton_FreeToPlay' );
	select.select();

	dialog.done( function ( )
	{
		var dialogWait = ShowBlockingWaitDialog( "\u8bf7\u7a0d\u5019", "\u6b63\u5728\u4fdd\u5b58\u60a8\u7684\u66f4\u6539\u2026");
		new Ajax.Request( 'https://partner.steamgames.com/store/ajaxupdatef2pstore',
			{
				method: 'POST',
				parameters: {
					'appid' : appid,
					'displaytext' : select.val(),
					'sessionid' : g_sessionID
				},
				onSuccess: function( transport )
				{
					dialog.Dismiss();
					var results = transport.responseJSON;
					if ( results[ 'success' ] == 1 )
					{
						// Now change the package type
						new Ajax.Request( 'https://partner.steamgames.com/store/ajaxpackagesave/' + packageid,
							{
								method: 'POST',
								parameters: {
									'action' : 'save',
									'billing_type' : 12,
									'sessionid' : g_sessionID
								},
								onSuccess: function( transport )
								{
									var results = transport.responseJSON;
									if ( results.success == 1 )
									{
										OnAIWaitComplete(function(){
											dialog.Dismiss();
											top.location.href = 'https://partner.steamgames.com/store/packagelanding/' + packageid;
										});
									}
									else
									{
										dialog.Dismiss();
										ShowAlertDialog( "\u9519\u8bef", "\u66f4\u6539\u7a0b\u5e8f\u5305\u7c7b\u578b\u5931\u8d25\uff1a%1$s".replace('%1$s', results.success ) );
									}
								}
							} );
					}
					else
					{
						ShowAlertDialog( '错误', "\u66f4\u65b0\u5546\u5e97\u5e94\u7528\u9875\u9762\u5931\u8d25\uff1a%1$s".replace('%1$s', results[ 'success' ] ) );
					}
				}
			});
	});

}


function IsDigitOrEditKeypress( e )
{
	try
	{
		var keynum = 0;

		if( e.keyCode )
		{
			keynum = e.keyCode;
		}
		else if( e.which )
		{
			keynum = e.which;
		}

		// tab
		if ( keynum == 9 ) return true;
		// backspace
		if ( keynum == 8 ) return true;
		// delete
		if ( keynum == 46 ) return true;
		// arrows
		if ( keynum == 37 || keynum == 38 || keynum == 39 || keynum == 40 ) return true;

		// digits
		if ( keynum >= 48 && keynum <= 57 ) return true;
	}
	catch( e )
	{

	}

	return false;
}

//Helper method to grab a value of the messageform, including radio button handling
function GetFormValueInternal( sFormName, inputName )
{
	var input = $( sFormName )[ inputName ];
	if ( input && input.length && input.length > 0  && input[0].type=='radio' )
	{
		//radio buttons
		input = $A(input).find( function ( r ) { return r.checked; } );
	}
	if ( input )
		return $F( input );
	else
		return null;
}


function GetSuffixForAssociationType( sAssociationType )
{
	switch ( sAssociationType )
	{
		case "application": return "[appid]";
		case "package": return "[packageid]";
		case "bundle": return "[bundleid]";
	}

	return null;
}


// User has changed associated app/package, request restrictions/etc from server
function OnAssociationChangeInternal( sFormName, sInputPrefix )
{
	var sAssociationType = GetFormValueInternal( sFormName, sInputPrefix + '[association_type]' );
	var sAssociation = '';
	var sSuffix = GetSuffixForAssociationType( sAssociationType );
	if ( sSuffix )
	{
		sAssociation = GetFormValueInternal( sFormName, sInputPrefix + '[association]' + sSuffix );
	}

	var hashParams = {
			associationType: 	sAssociationType,
			association:  		sAssociation,
	};
	new Ajax.Request( g_szBaseUrl + '/store/fetchassociationdefaults', {
		method: 'get',
		requestHeaders: { 'Accept': 'application/json' },
		parameters: hashParams,
		onSuccess: ( transport ) =>
		{
			var results = transport.responseJSON;
			if ( results )
			{
				ReadAssociationValuesInternal( results, sFormName, sInputPrefix );
			}
		}
	});
}

function OnSpotlightAssociationChange()
{
	OnAssociationChangeInternal( "spotlightform", "spotlight" );
}

function OnClusterAssociationChange()
{
	OnAssociationChangeInternal( "clusterform", "cluster" );
}

//server has replied with restrictions for the new association
function ReadAssociationValuesInternal( json, sFormName, sInputPrefix )
{
	var hash = $H(json);

	hash.each( ( entry ) =>
	{
		input = $( sFormName )[ sInputPrefix + entry.key];
		if ( input )
		{
			input.value = entry.value;
		}
	} );
}

function ShowAddAppsDialog( nPackageId, bPublished, nIncludeAppIDForDepots = 0, bCreateBetaPkg = false )
{
	new Ajax.Request( 'https://partner.steamgames.com/store/ajaxpackageaddapps/' + nPackageId, {
			method: 'POST',
			parameters: {
				'package_released' : bPublished ? '1' : '0',
				'sessionid' : g_sessionID
			},
	onSuccess: function( transport )
	{
		var dialog = ShowConfirmDialog( '添加应用', transport.responseText, '继续' );
		dialog.SetRemoveContentOnDismissal( false );
		dialog.done( function() {
			var appIds = Array();
			var checkboxes = dialog.GetContent().find('input[type="checkbox"]');
			for ( var i = 0; i < checkboxes.length; ++i )
			{
				var checkbox = checkboxes[i];
				if ( checkbox.checked )
				{
					appIds.push( checkbox.value );
				}
			}

			dialog.GetContent().remove();

			if ( nIncludeAppIDForDepots > 0 )
			{
				appIds.push( nIncludeAppIDForDepots );
			}

			if ( appIds.length == 0 )
			{
				return;
			}
			ShowManageDepotsDialog( nPackageId, appIds, bCreateBetaPkg );
		} );

		dialog.fail( function() {
			if ( bCreateBetaPkg )
			{
				$J.post( 'https://partner.steamgames.com/store/ajaxcreatebetapackagefrompackage/' + nPackageId, {
					'sessionid' : g_sessionID
				} );
			}
			dialog.GetContent().remove();
		});
	}
} );
}

function ShowManageDepotsDialog( nPackageId, overrideAppIds, bCreateBetaPkg = false )
{
	$J.post( 'https://partner.steamgames.com/store/ajaxpackagemanagedepots/' + nPackageId, {
			'appids' : overrideAppIds,
			'sessionid' : g_sessionID
		}
	).done( function( response ) {
		var dialog = ShowConfirmDialog( '添加/移除 Depot', response, '保存' );
		dialog.SetRemoveContentOnDismissal( false );

		$J('#manageDepotsFilterTable').tableFilter({'control': '#manageDepotsFilterControl', 'defaultText': 'type here to filter'});

		dialog.done( function() {
			var appIds = Array();
			var hiddenInputs = dialog.GetContent().find('input[type="hidden"]');
			for ( var i = 0; i < hiddenInputs.length; ++i )
			{
				appIds.push( hiddenInputs[i].value );
			}
			var depotIds = Array();
			var checkboxes = dialog.GetContent().find('input[type="checkbox"]');
			for ( var i = 0; i < checkboxes.length; ++i )
			{
				var checkbox = checkboxes[i];
				if ( checkbox.checked )
				{
					depotIds.push( checkbox.value );
				}
			}

			// now save
			var dialogWait = ShowBlockingWaitDialog( 'Please Wait', 'Saving your changes...' );
			$J.post( 'https://partner.steamgames.com/store/ajaxpackagesave/' + nPackageId, {
					'action' : 'manageDepots',
					'appids' : appIds,
					'depotids' : depotIds,
					'sessionid' : g_sessionID
				}
			).done( function( response ) {

				if ( response.success == 1 )
				{
					OnAIWaitComplete(function(){
						if ( bCreateBetaPkg )
						{
							$J.post( 'https://partner.steamgames.com/store/ajaxcreatebetapackagefrompackage/' + nPackageId, {
								'sessionid' : g_sessionID
							} );
						}

						dialogWait.Dismiss();
						top.location.href = 'https://partner.steamgames.com/store/packagelanding/' + nPackageId;
					});
				}
			else
				{
					dialogWait.Dismiss();
					ShowAlertDialog( 'Error', 'Failure code: ' + response.success );
				}
			});

			dialog.GetContent().remove();

		} );

		dialog.fail( function() {
			if ( bCreateBetaPkg )
			{
				$J.post( 'https://partner.steamgames.com/store/ajaxcreatebetapackagefrompackage/' + nPackageId, {
					'sessionid' : g_sessionID
				} );
			}
			dialog.GetContent().remove();
		});
	} );
}

function Logout()
{
	var $Form = $J('<form/>', {'action': 'https://partner.steamgames.com/login/logout/', 'method': 'POST' } );
	$Form.append( $J('<input/>', {'type': 'hidden', 'name': 'sessionid', 'value': g_sessionID } ) );
	$Form.appendTo( 'body' );
	$Form.submit();
}


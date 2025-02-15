Weekday
http://shop.weekday.com/
Copenhagen
Denmark
60
4
0

node.downloadTemplate(input, scanEvents, function(body) {
	node.addmetadata("site_info", {
		url: url,
		city : city,
		country : country
	});
	
	var parsedHTML = $.load(body);

	return parsedHTML("ul.navigation-items > li > a").map(function(i, x) { 
		var header = $(x);
		var tabName = header.attr("data-sub-menu");
		
		if (!tabName) {
			return;
		}
		
		console.log(tabName);
		
		var submenu = parsedHTML("div.sub-menu[data-sub-menu-name=]")
		
		return [];

		// filter high level categories
		if (tabName == "What's new" || tabName == "Accessories" || tabName == "Sale" || tabName == "$20$30$40SALE" || tabName == "Back to stock" || tabName == "Blog") {
			return;
		}
		
		var subheaders = header.find("ul.drop > li > a");
		subheaders.splice(0,1);
		
		return (nodes[1])({
			name : tabName,
			subheaders : subheaders
		}); 
	});	
});

node.directTemplate(input, scanEvents, function(input) {
	var dataList = input.subheaders, i, l = dataList.length, childList=[];
	for(i=0; i<l; i+=1) {
		var anchor = $(dataList[i]);
		childList.push((nodes[3])({
			data : anchor.attr("href") + "?limit=all",
			name : anchor.text().trim()
		})); 
	}
	return childList;
});

node.downloadTemplate(input, scanEvents, function(body) {
	var parsedHTML = $.load(body);
	
	return parsedHTML("div.category-products > ul.products-grid > li.item").map(function(i, x) { 
		var item = $(x);
		
		// get name
		var name = item.find("p.thumb-caption-title").text().trim();
		
		// get price
		var pricetag = item.find("div.price-box");
		var regularpricetag = pricetag.find("span.regular-price");
		var oldpricetag = pricetag.find("span.old-price");
		var specialpricetag = pricetag.find("span.special-price");
		if (regularpricetag.length == 0) {
			var current_price = parseFloat(specialpricetag.text().match(/\d+\.\d+/));
			var original_price = parseFloat(oldpricetag.text().match(/\d+\.\d+/));
		} else {
			var current_price = parseFloat(regularpricetag.text().match(/\d+\.\d+/));
			var original_price = current_price;
		}

		// link
		var link = item.find("a.thumb-image").attr("href");
		
		return (nodes[4])({
			data : link,
			name : name,
			current_price : current_price,
			original_price : original_price
		}); 
	});	
});

node.downloadTemplate(input, scanEvents, function(body) {
	var parsedHTML = $.load(body);

	// get image list
	var imagehtml = parsedHTML("#more-views > ul > li > a");
	var i, l=imagehtml.length, imageList=[];
	for(i=0; i<l; i+=1) {
		var item = $(imagehtml[i]);
		imageList.push(item.attr("rel").match(/smallimage: '([^ ]+)'/)[1]);
	}

	// get size list
	var sizeshtml = parsedHTML("ul.size-list-wrapper > li > a");
	var i, l=sizeshtml.length, sizes=[];
	for(i=0; i<l; i+=1) {
		sizes.push({
			size: $(sizeshtml[i]).attr("rel")
		});
	}

	// get id
	var id = parsedHTML("span.sku").text().trim();
	
	// handle repeats
	if (scanEvents.checkItem(node, id)) {
		return;
	}
	
	// get description
	var deschtml = parsedHTML("#tabs-1 > p");
	var i, l=deschtml.length, desclist=[];
	for(i=0; i<l; i+=1) {
		desclist.push($(deschtml[i]).text().trim());
	}
	var desc = desclist.join("<br/>");

	// add data to node metadata
	node.addmetadata("url", input.data);
	node.addmetadata("id", id);
	node.addmetadata("current_price", input.current_price);
	node.addmetadata("original_price", input.original_price);
	node.addmetadata("long_desc", desc);
	node.addmetadata("variations", [
		{ 
			image_links: imageList,
			sizes : sizes
		}
	]);
	
	// register item
	scanEvents.setItem(node);
	
	return [];
});
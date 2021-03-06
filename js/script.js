$(function () {
  // Same as document.AddEventListener("DOMContentLoaded"..)

  // Same as document.querySelector("#navbarToggle").addEventListener("Blur")
  $("#navbarToggle").on("blur", function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });

  $("#navbarToggle").on("click", function (event) {
    $(event.target).focus();
  });
});

(function (global) {
  var dc = {};

  var homeHtml = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "http://davids-restaurant.herokuapp.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  //convinience function for inserting innerHTML for 'select'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Return subtiture of '{{propName}}'
  // with propValue in given 'String'

  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";

    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };


  // Remove the class 'active' from home and switch to menu butoon
  var switchMenuToActive = function () {
      // remove 'acitve' from home button
      var classes = document.querySelector("#navHomeButton").className;
      classes = classes.replace(new RegExp("active", "g"), "");
      document.querySelector("#navHomeButton").className = classes;
      
      // add 'active' to menu button if not already there
      classes = document.querySelector("#navMenuButton").className;
      if(classes.indexOf("active") == -1) {
          classes += " active";
          document.querySelector("#navMenuButton").className = classes;
      }
  }

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
    // On first load, show home view
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content").innerHTML = responseText;
      },
      false
    );
  });

  // Load the menu categories view
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTMl);
  };

  // Load the menu items view
  // 'categoryShort' is a short_name for a category

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  // Builds HTML for the categroeis page based on the data
  // from the server
  function buildAndShowCategoriesHTMl(categories) {
    // Load title snippet of categories page

    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        //Retrieve single category snippet
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {

            switchMenuToActive();

            var categoriesViewHTML = buildCategoriesViewHTML(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            insertHtml("#main-content", categoriesViewHTML);
          },
          false
        );
      },
      false
    );
  }

  // using categories data and snippets html
  // build categories view html to be inserted into page
  function buildCategoriesViewHTML(
    categories,
    categoriesTitleHTMl,
    categoryHTML
  ) {
    var finalHTML = categoriesTitleHTMl;
    finalHTML += "<section class='row'>";

    // Loop over categories
    for (var i = 0; i < categories.length; i++) {
      //insert category values
      var html = categoryHTML;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;

      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHTML += html;
    }

    finalHTML += "</section>";
    return finalHTML;
  }

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    //Load title snippet of menu items page
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        // Retrieve singe menu items snippet
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            switchMenuToActive();
            var menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  // Using category and menu items data and snippets html
  // builds menu items views hTML to be inserted page
  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    var finalHTML = menuItemsTitleHtml;
    finalHTML += "<section class='row'>";

    // loop over categories
    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;
    for (var i = 0; i < menuItems.length; i++) {
      // Insert menu item values
      var html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);

      // Add clearfix after every second menu item
      if (i % 2 != 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }

      finalHTML += html;
    }
    finalHTML += "</section>";
    return finalHTML;
  }

  // Appends price with '$' if price exist
  function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  // Appends portion name in parents if it exists

  // Appends portion name in parens if it exists
  function insertItemPortionName(html, portionPropName, portionValue) {
    // If not specified, return original string
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }

  global.$dc = dc;
})(window);

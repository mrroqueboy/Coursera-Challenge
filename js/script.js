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

  global.$dc = dc;
})(window);

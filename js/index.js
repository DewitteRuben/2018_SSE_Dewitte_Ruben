let indexModule = (function () {
    let CATEGORY = {
        ALL: "ALL"
    };

    let HTML = {
        LI_ALL_TAB: `<li data-category="ALL" class="tab"><a href="#tab-all">ALL</a></li>`,
        UL_EMPTY_CARDSET: `<ul class="collection with-header collection-cardsets">
                <li class="collection-item">No cardsets have been created yet!</li>
                </ul>`,
    };

    let URL = {
        GAME_PAGE: "cardgame.html"
    };

    function init() {
        let $tabs = $(".tabs");
        let $cards = $(".cards");
        initCardsetsList($cards, CATEGORY.ALL);
        initCategoryTabs($tabs);
        $tabs.on("click", ".tab", evChangingTabs);
        $cards.on("click", ".delete-card-collection-item", evTriggerCardDelete);
    }

    function initCategoryTabs() {
        DataModule.pGetAllCardsets()
            .then(cardsetCategories2TabElements)
            .then(populateTabsElementWithTabs)
            .catch(err => console.log(err, ""));
    }

    function populateTabsElementWithTabs($filteredTabs) {
        let $allTab = $(HTML.LI_ALL_TAB);

        let $tabs = $('.tabs');
        if ($tabs.hasClass("initalized")) {
            $tabs.removeClass("initalized");
            $tabs.tabs("destroy");
        }

        $tabs
            .html("")
            .append($allTab)
            .append($filteredTabs)
            .addClass("initalized")
            .tabs()
            .tabs("select", "tab-all");
    }

    function cardsetCategories2TabElements(cardsetMap) {
        let categories = UtilModule.getUniqueValuesOfObjectsInMap(cardsetMap, "category").sort();
        return $(categories2tabs(categories));
    }

    function categories2tabs(cArray) {
        return cArray.map(c => `<li data-category="${c}" class="tab"><a href="#tab-filtered">${c}</a></li>`).join("");
    }

    function cardsetMap2CardsetArrByCategory(category) {
        return function (cardsetMap) {
            let values = Array.from(cardsetMap.values());
            return values.filter(cardsetIsOfCategory(category)).sort(UtilModule.cardsetNameComparator);
        }
    }

    function arrByCategory2HTMLString(filteredCardsets) {
        return filteredCardsets.map(cs => cs.render()).join("");
    }


    function ensureEmptyCardset(HTMLString) {
        if (HTMLString.length === 0) HTMLString += HTML.UL_EMPTY_CARDSET;
        return HTMLString;
    }

    function populateCardsetsList($list) {
        return function (HTMLString) {
            $list.html(HTMLString);
            bindCardsetEventHandlers();
        }
    }

    function cardsetIsOfCategory(category) {
        return function (cardset) {
            return cardset.category === category || category === CATEGORY.ALL;
        }
    }

    function deleteCardByID(cardID) {
        return function (e) {
            DataModule.pDeleteCardFromCardset(cardID)
                .then(e => init())
                .catch(err => GuiModule.showToast(err, ""));
        }
    }

    function deleteCardsetByID(cardsetName) {
        return function (e) {
            DataModule.pDeleteCardset(cardsetName)
                .then(e => init());
        }
    }

    function initCardsetsList($list, category) {
        DataModule.pGetAllCardsets()
            .then(cardsetMap2CardsetArrByCategory(category))
            .then(arrByCategory2HTMLString)
            .then(ensureEmptyCardset)
            .then(populateCardsetsList($list))
            .catch(err => console.log(err));
    }

    function headerAddCardCardset(e) {
        e.preventDefault();
        e.stopPropagation();
        let cardsetName = $(this).parents("section").data("cardset");
        sessionStorage.setItem("currentCardset", cardsetName);
        $(".nav-addcard").click();
    }

    function showEditCardsetModal(oldName, oldCategory) {
        let id = "editCardsetNameModal";
        let content = `<h5>Cardset ${oldName}</h5>
            <p>Enter a new name:</p>
            <div class="input-field">
                <label class="active" for="newName">New name:</label>
                <input type="text" value="${oldName}" name="cardset-newName" id="cardset-newName">
            </div>
            <div class="input-field">
                <label class="active" for="newName">New category:</label>
                <input  type="text" value="${oldCategory}" name="cardset-newCategory" id="cardset-newCategory">
            </div>`;
        GuiModule.generateModal(id, content, "Decline", "Confirm", evConfirmCardsetNameChangePredicate(oldName));
    }

    function evShowEditCardsetModal(e) {
        e.preventDefault();
        e.stopPropagation();
        let oldName = $(this).parents(".cardset").data("cardset");
        let oldCategory = $(this).parents(".cardset").data("category");
        showEditCardsetModal(oldName, oldCategory);
    }

    function showDeleteCardModal(cardID, cardTitle) {
        let modalContent = `<h5>${cardTitle}</h5>
        <p>Are you sure you want to delete the card "${cardTitle}" from the cardset "${cardID.split("-")[0]}"?</p>`;
        GuiModule.generateModal("deleteModal", modalContent, "Decline", "Confirm", deleteCardByID(cardID));
    }

    function evShowDeleteCardsetModal(e) {
        e.preventDefault();
        e.stopPropagation();
        let cardsetName = $(this).parents(".cardset").data("cardset").toString();
        let content = `<p>Are you sure you wish to delete the cardset ${cardsetName}?</p>`;
        GuiModule.generateModal("deleteCardsetModal", content, "Decline", "Confirm", deleteCardsetByID(cardsetName));
    }


    function evInitNewGame(e) {
        e.preventDefault();
        e.stopPropagation();
        let cardSetName = $(this).parents("section").data("cardset");
        DataModule.startCurrentGame(cardSetName).then((result) => {
            $("#gamePageAnchor").click();
        }).catch(err => GuiModule.showToast(err, ""));
    }

    function bindCardsetEventHandlers() {
        $(".collapsible").collapsible();
        $(".collapsible-header").on("click", evToggleHide);
        $(".home-add-cardset").on("click", headerAddCardCardset)
            .next().on("click", evShowEditCardsetModal)
            .next().on("click", evShowDeleteCardsetModal)
            .next().on("click", evInitNewGame);
    }

    function evToggleHide(e) {
        e.preventDefault();
        $(this).toggleClass("closed");
        $(this).find("a.home-hide-cardset")
            .find("i")
            .text($(this).hasClass("closed") ? "arrow_drop_down" : "arrow_drop_up");
    }

    function evConfirmCardsetNameChangePredicate(oldName) {
        return function (e) {
            e.preventDefault();
            let newName = $("#cardset-newName").val();
            let newCategory = $("#cardset-newCategory").val();
            let cardset = new DomainModule.CardSet(newName, newCategory);
            DataModule.pUpdateCardset(oldName, cardset).then(
                e => {
                    initCardsetsList($(".cards"), CATEGORY.ALL);
                    initCategoryTabs($(".tabs"));
                }
            ).catch(err => GuiModule.showToast(err, ""));
        }
    }


    function evTriggerCardDelete(e) {
        e.preventDefault();
        let cardID = $(this).parent().attr("id");
        let cardTitle = $(this).siblings(".card-content").find(".card-title").text();
        showDeleteCardModal(cardID, cardTitle);
    }


    function evChangingTabs(e) {
        e.preventDefault();
        let category = $(this).data("category");
        initCardsetsList($(".cards-filtered"), category);
    }

    return {
        init: init,
    }

})();

$(document).ready(function () {
    indexModule.init();
    $('.fixed-action-btn').floatingActionButton();
});
let editCardModule = (function () {

    let editingCard;

    function loadCard() {
        editingCard = JSON.parse(sessionStorage.getItem("editingCard"));
        if (editingCard) {
            fillFormWithCard(editingCard);
        }
    }

    function changeButtonText() {
        $(".btn-add-card").text("Update card").find("i").text("update");
    }

    function evUpdateCard(e) {
        e.preventDefault();
        console.log(editingCard);
        let card = addCardModule.getCardFromInput();
        card.id = editingCard.id;
        DataModule.pUpdateCard(card).then(function (msg) {
            GuiModule.showToast(msg, "");
        }).catch(function (err) {
            GuiModule.showToast(err, "");
        })
    }

    function updateFormUI() {
        if (editingCard) {
            changeButtonText();
            $(".form-add-card").off().on("submit", evUpdateCard);
        }
    }

    function init() {
        loadCard();
        updateFormUI();
    }


    function type2AnswerElement(answer, cardType) {
        return {
            SA: "card-answer", //name = answer
            MC: "card-answer-mc",
            TF: answer ? "answer-true" : "answer-false"
        }[cardType];
    }

    function cardKeyToElementMap(card) {
        return {
            typeAnswer: "checkbox-type-answer",
            answer: type2AnswerElement(card.answer, card.type),
            title: "card-name",
            type: "card-types",
            answerChoices: "card-possible-mc", //still needs a name attr
            question: "card-question", // name = question
            image: "imageName"
        };
    }

    function fillFormWithCard(card) {
        let cardKey2ElementMap = cardKeyToElementMap(card);
        for (var cardKey in card) {
            if (card.hasOwnProperty(cardKey)) {
                let $element = $(`#${cardKey2ElementMap[cardKey]}`);
                let elementType = $element.prop("nodeName");
                switch (elementType) {
                    case "INPUT":
                        if ($element.prop("type") === "checkbox")
                            $element.prop("checked", card[cardKey]);
                        else
                            $element.val(card[cardKey]);
                        break;
                    case "SELECT":
                        $element.val(card[cardKey]).formSelect().change();
                        break;
                    case "A":
                        $element.click();
                        break;
                    case "SPAN":
                        if (card[cardKey]) {
                            localStorage.setItem(DataModule.KEYS.PICTURE, JSON.stringify(card[cardKey]));
                            addCardModule.updateImageSpan();
                        }
                        break;
                }
            }
        }

    }

    return {
        init: init
    }
})();

$(document).ready(() => {
    editCardModule.init();
});

$(window).on("beforeunload", function () {
    sessionStorage.removeItem("editingCard");
});
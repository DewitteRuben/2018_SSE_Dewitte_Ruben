import {isEqualToCaseInsensitive, isEmpty} from "./utilities";
import {showToast} from "./gui";
import {pAddHighscore} from "./data";
import {isCompactViewEnabled, startsCollapsed} from "./settings/settings";


const cardTypeToPrettyName = {
    "SA": "Single Answer",
    "TF": "True or False",
    "MC": "Multiple Choice",
};


export function Card(title, type, question, answer) {
    this.id = null;
    this.title = title;
    this.type = type;
    this.question = question;
    this.image = null;
    this.answer = answer;
    this.guess = null;
    this.answerChoices = null;
    this.typeAnswer = false;
}

Card.prototype.clearGuess = function () {
    this.guess = null;
};

export function Game(cardset) {
    this.cardset = cardset;
    this.currentCardIndex = 0;
    this.isFront = true;
    this.timeFinished = null;
}

Game.prototype.reset = function () {
    this.currentCardIndex = 0;
    this.isFront = true;
    this.timeFinished = null;
    this.cardset.cards.forEach(c => c.clearGuess());
};

Game.prototype.nextCard = function () {
    if (this.cardset.cards.length > 0) {
        if (this.currentCardIndex + 1 <= this.cardset.cards.length - 1) {
            this.currentCardIndex++;
        } else {
            this.currentCardIndex = 0;
        }
    }
};

Game.prototype.prevCard = function () {
    if (this.cardset.cards.length > 0) {
        if (this.currentCardIndex - 1 >= 0) {
            this.currentCardIndex--;
        } else {
            this.currentCardIndex = this.cardset.cards.length - 1;
        }
    }
};

Game.prototype.answer = function (guess) {
    this.getCurrentCard().guess = guess;
};

Game.prototype.isFinished = function () {
    return this.getAmountCards() === this.getAnsweredCards().length;
};

Game.prototype.getCorrectCards = function () {
    return this.getAnsweredCards().filter(c => c.isCorrectAnswer() === true);
};

Game.prototype.getAmountCorrectAnswers = function () {
    return this.getCorrectCards().length;
};

Game.prototype.getAnswerAccuracy = function () {
    return Math.round((this.getCorrectCards().length / this.cardset.cards.length) * 100);
};

Game.prototype.getAmountWrongAnswers = function () {
    return this.getAmountCards() - this.getAmountCorrectAnswers();
};

Game.prototype.getAmountCards = function () {
    return this.cardset.cards.length;
};

Game.prototype.getAnsweredCards = function () {
    return this.cardset.cards.filter(c => c.guess !== null);
};

Game.prototype.hasBeenCorrectlyAnswered = function (card) {
    return this.getCorrectCards().filter(c => c.id === card.id).length > 0;
};

Game.prototype.hasBeenAnswered = function (card) {
    return this.getAnsweredCards().filter(c => c.id === card.id).length > 0;
};


Game.prototype.getCurrentCard = function () {
    return this.cardset.cards[this.currentCardIndex];
};

Card.prototype.renderCompact = function () {
    return `<div id="${this.id}" data-card="${this.id}" class="card">
                <a href="#" class="faint-black delete-card-collection-item"><i class="delete material-icons">delete</i></a>
                <a href="#/" class="faint-black edit-card-collection-item"><i class="edit material-icons">edit</i></a>
                ${this.image ? `<a href="#" class="faint-black image-card-collection-item"><i class="photo material-icons">photo</i></a>` : ""}
                <div class="card-content">
                    <span class="card-title compact-title">${this.title}</span>
                    <p>Q: ${this.question}</p>
                    <p class="answer">A: ${this.answer}</p>
                    <p class="answers">${this.isMultipleChoice() ? `<p class="choices">${this.answerChoices.join(",")}</p>` : ""}</p>
                    <p class="type">${cardTypeToPrettyName[this.type]}</p>
                    <p class="typing type keyboard">${this.typeAnswer ? '<i class="material-icons">keyboard</i>' : ''}</p>
                </div>   
            </div>`;
};

Card.prototype.render = function () {
    let HTMLString =
        `<div id="${this.id}" class="card">
                               <a href="#/" class="faint-black delete-card-collection-item"><i class="delete material-icons">delete</i></a>
                               <a href="#/" class="faint-black edit-card-collection-item"><i class="edit material-icons">edit</i></a>
                               <div class="card-content">
                                    <span class="card-title">${this.title}</span>`;

    if (this.image) {
        HTMLString += `<div class="center">
                                  <img class="responsive-img" src="${this.image.data}" alt="card-image" title="card-image"">
                           </div>`;
    }

    HTMLString += `<p>Q: ${this.question}</p>
                                </div>
                                <div class="card-action">
                                    <p class="answer">A: ${this.answer}</p>
                                    <p class="answers">${this.isMultipleChoice() ? `<p class="choices">
                                                                ${this.answerChoices.join(",")}
                                                                </p>` : ""}</p>
                                    <p class="type">${cardTypeToPrettyName[this.type]}</p>
                                    <p class="typing type keyboard">${this.typeAnswer ? '<i class="material-icons">keyboard</i>' : ''}</p>
                                </div>
                            </div>`;
    return HTMLString;
};

Card.prototype.isCorrectAnswer = function () {
    return isEqualToCaseInsensitive(this.answer, this.guess);
};

Card.prototype.isMultipleChoice = function () {
    return this.type === "MC" || Array.isArray(this.answerChoices);
};

Card.prototype.isValid = function () {
    return !(isEmpty(this.title) ||
        isEmpty(this.type) ||
        isEmpty(this.question) ||
        isEmpty(this.answer))
};

export function CardSet(name, category) {
    this.name = name;
    this.category = category;
    this.cards = [];
}

CardSet.prototype.addCard = function (card) {
    this.cards.push(card);
};

CardSet.prototype.render = function () {
    let HTMLString = `
                <section class="cardset" data-cardset="${this.name}" data-category="${this.category}">
                    <ul class="collapsible">
                        <li ${startsCollapsed() ? "" : 'class="active"'}>
                    <div class="collapsible-header">
                    <i class="material-icons">folder</i>${this.name}
                    <a href="#/" class="faint-black home-hide-cardset"><i class="material-icons">arrow_drop_up</i></a>

                    <div class="collapsible-items">
                        <a href="#/" class="faint-black home-add-cardset"><i class="material-icons">add</i></a>
                        <a href="#/" class="faint-black home-edit-cardset"><i class="material-icons">edit</i></a>
                        <a href="#/" class="faint-black home-delete-cardset"><i class="material-icons">delete</i></a>
                        <a href="#/" class="faint-black home-play-cardset"><i class="material-icons">play_arrow</i></a>
                    </div>
                        
                  
                </div>
                <div class="collapsible-body">`;

    this.cards.forEach(card => HTMLString += isCompactViewEnabled() ? card.renderCompact() : card.render());

    if (this.cards.length === 0)
        HTMLString += `<span class="center">No cards have been added yet, tap the <i class="material-icons">add</i> button to add a card!</span>`;

    HTMLString += `</div>
                       </li>
                    </ul>
                </section>`;
    return HTMLString;
};

CardSet.prototype.isValid = function () {
    return (!isEmpty(this.name) && !isEmpty(this.category));
};

export function Image(name, data) {
    this.name = name;
    this.data = data;
}

export function Highscore(game, gameTime, date, realTime) {
    this.date = date;
    this.realTime = realTime;
    this.game = game;
}

Highscore.prototype.save = function (cb) {
    pAddHighscore(this).then(cb).catch(function (err) {
        showToast(err, "");
    })
};

Highscore.prototype.render = function () {
    let HTMLString = `<tr>
            <td>${this.game.cardset.name}</td>
            <td>${this.game.timeFinished}</td>
            <td>${this.date.slice(0, -5)} ${this.realTime.slice(0, -3)}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>`;
    this.game.cardset.cards.forEach(c => {
        HTMLString += `<tr>
                <td></td>
                <td>${isEqualToCaseInsensitive(c.guess, c.answer) ?
            `<i class="material-icons">check</i>` :
            `<i class="material-icons">close</i>`}</td>
                <td></td>
                <td>${c.title}</td>
                <td>${c.guess}</td>
                <td>${c.answer}</td>
            </tr>`
    });
    return HTMLString;
};
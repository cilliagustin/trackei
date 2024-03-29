/* jshint esversion: 11 */

let data = [];
let dataByDate;
let incomedata;
let expensedata;
let incomeTotal;
let expenseTotal;

//Take data from each transaction, create all objects and arrays necesary 
//and populate the website
submit.addEventListener('click', (e) => {
    e.preventDefault();
    let a = parseFloat(inputAmount.value).toFixed(2);
    let b = inputNote.value;
    let c = inputDate.value;
    let d = inputCategory.value;
    //Check that all inputs are correctly filled
    if (a < 0.01) {
        //create Popup confirming new transaction
        if (!document.querySelector("#pop-up")) {
            createPopUp('orange', 'fa-circle-exclamation', 'Amount must be</br>at least 1 cent');
        } else {
            closePopUp();
            createPopUp('orange', 'fa-circle-exclamation', 'Amount must be</br>at least 1 cent');
        }
    } else if (a == null || a == "" || isNaN(a) === true || b == null || b == "" || c == null || c == "" || d == null || d == "") {
        if (!document.querySelector("#pop-up")) {
            createPopUp('orange', 'fa-circle-exclamation', 'Please complete</br>all the fields');
        } else {
            closePopUp();
            createPopUp('orange', 'fa-circle-exclamation', 'Please complete</br>all the fields');
        }
    } else {
        //Create data with all transaction information and add to local storage
        createData(a, b, c, d);
        localStorage.setItem('data', JSON.stringify(data));
        //Adds to the dataBy date transactions grouped by date and orders ir from most recent to oldestone
        dataByDate = sortObj(groupBy('date', data));
        //Populates the calendar section with the dataByDate
        populateCalendar(dataByDate);
        //Create data for expense and income transactions
        createBalanceData(data);
        //Populates the Add section with the income and expense data
        populateBalance();


        //filter balance section so it shows the transaction type added
        let currentType;
        if (addSection.classList.contains('income')) {
            currentType = "income";
        } else if (addSection.classList.contains('expense')) {
            currentType = "expense";
        }
        //add correct class to balance section
        balanceSection.classList.remove('expense', 'income');
        balanceSection.classList.add(currentType);
        //give active class to correct button
        deleteActive(balanceExpenseIncomeBtn);
        balanceExpenseIncomeBtn.forEach(btn => {
            if (btn.getAttribute('data-button-category') === currentType) {
                btn.classList.add('active');
            }
        });
        let balanceElements = document.querySelectorAll('[data-add-category]');
        hideElements(balanceElements);
        balanceElements.forEach(el => {
            if (el.getAttribute('data-add-type') === currentType) {
                el.classList.remove('hide');
            }
        });

        //create Popup confirming new transaction
        if (!document.querySelector("#pop-up")) {
            createPopUp('blue', 'fa-circle-check', 'Transaction succesfully added!');
        } else {
            closePopUp();
            createPopUp('blue', 'fa-circle-check', 'Transaction succesfully added!');
        }

    }
});

function createPopUp(colour, icon, title) {
    let popUp = document.createElement('div');
    popUp.setAttribute('id', 'pop-up');
    popUp.classList.add(colour);
    let popUpHead = document.createElement('div');
    popUpHead.classList.add('pop-up-head');
    let checked = document.createElement('i');
    checked.classList.add('fa-solid', icon);
    popUpHead.appendChild(checked);
    popUp.appendChild(popUpHead);
    let popUpBody = document.createElement('div');
    popUpBody.classList.add('pop-up-body');
    let h2 = document.createElement('h2');
    h2.innerHTML = title;
    let h3 = document.createElement('h3');
    h3.textContent = 'This pop up will close in 4 seconds';
    let cross = document.createElement('i');
    cross.setAttribute('id', 'close-pop-up');
    cross.classList.add('fa-solid', 'fa-xmark');
    let loader = document.createElement('div');
    loader.classList.add('loader');
    popUpBody.appendChild(h2);
    popUpBody.appendChild(h3);
    popUpBody.appendChild(cross);
    popUpBody.appendChild(loader);
    popUp.appendChild(popUpBody);
    document.body.insertBefore(popUp, balanceSection);

    timeoutToClose = setTimeout(closePopUp, 4000);
}

let timeoutToClose;

function closePopUp() {
    clearTimeout(timeoutToClose);
    let popUp = document.querySelector("#pop-up");
    if (popUp) {
        popUp.remove();
    }
}



//Creates the data with all transactions
function createData(a, b, c, d) {
    //Create an object
    let obj = {};
    //Add income/expense property as transaction type to the object
    if (addSection.classList.contains('income')) {
        obj.type = "income";
    } else if (addSection.classList.contains('expense')) {
        obj.type = "expense";
    }
    //Add the time stamp as a transaction ID
    obj.timeStamp = Date.now();
    //Add amount, note, date and category to object
    obj.amount = Number(a);
    obj.note = b;
    obj.date = c;
    obj.category = d;
    //push the object to the data Array
    data.push(obj);
    //Clean inputs but mantain current transaction type
    deleteValues(inputs);
    inputCategory.classList.remove('active');
    uncheckRadioInputs(addRadioInput);
}

//Groups the data by a specific key
const groupBy = (key, arr) => arr
    .reduce(
        (cache, product) => {
            const property = product[key];
            if (property in cache) {
                return {
                    ...cache,
                    [property]: cache[property].concat(product)
                };
            }
            return {
                ...cache,
                [property]: [product]
            };
        }, {}
    );

//Orders the array of objects by key value in reverse
function sortObj(obj) {
    return Object.keys(obj).sort().reverse().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

//Populate calendar section with dataByDate obj
function populateCalendar(obj) {
    //check if the data by date is an empty object
    if (Object.keys(dataByDate).length !== 0) {
        //delete empty class if active
        calendarSection.classList.remove('empty');
        //Create empty string that will finally populate the calendar section
        let calendarContent = "";
        //iterate the object
        Object.keys(obj).forEach(key => {
            let transactionDay = key;
            //transform yyyy/mm/dd format of date into dd/mm/yyyy
            let [year, month, day] = transactionDay.split('-');
            let transactionDate = [day, month, year].join('/');
            //Create empty string that will include all information of the day
            let transactionsOfTheDay = "";
            //Create variable for the result of the day (all the incomes - all expenses)
            let dailyResult = 0;
            //Iterate in the objects inside the array for each day
            Object.keys(obj[transactionDay]).forEach(objKey => {
                //Get all values for each transaction
                let transaction = objKey;
                let transactionData = obj[transactionDay][transaction];
                let transactionCategory = transactionData.category;
                let transactionNote = transactionData.note;
                let transactionAmount = transactionData.amount.toFixed(2);
                let transactionId = transactionData.timeStamp;
                let transactionType = transactionData.type;

                let transactionAmountStyled;
                //if transaction is income transactionAmountStyled will have a "$"" added and 
                //this amount will be added to the daily result, otherwise if is expense, transactionAmountStyled
                //will have "-$" added and the daily reult will have this amount subtracted
                if (transactionType === "income") {
                    dailyResult = dailyResult + Number(transactionAmount);
                    transactionAmountStyled = `<span data-currency>${selectedCurrency}</span> <span data-amount>${transactionAmount}</span>`;
                } else if (transactionType === "expense") {
                    dailyResult = dailyResult - Number(transactionAmount);
                    transactionAmountStyled = `<span data-currency>-${selectedCurrency}</span> <span data-amount>${transactionAmount}</span>`;
                }

                // Add variables to a string with the html code and each loop add it to the transactionsOfTheDay variable
                let transactionLi = `
                <li>
                    <div class="date-movement" data-type="${transactionType}" id="id${transactionId}">
                        <span class="movement-circle"></span>
                        <p class="movement-category">${transactionCategory}</p>
                        <p class="movement-note">${transactionNote}</p>
                        <p class="movement-amount">${transactionAmountStyled}</p>
                        <i class="movement-cross fa-solid fa-xmark"></i>
                    </div>
                </li>
                `;
                transactionsOfTheDay += transactionLi;
            });
            //if the dailyResult is positive add a "$"", if is negative style it with a "$" between the number and the "-" 
            if (dailyResult >= 0) {
                dailyResult = `<span data-currency>${selectedCurrency}</span> <span data-amount>${dailyResult.toFixed(2)}</span>`;
            } else if (dailyResult < 0) {
                dailyResult = `<span data-currency>-${selectedCurrency}</span> <span data-amount>${Math.abs(dailyResult).toFixed(2)}</span>`;
            }
            //Create a variable for all the information of the day
            let dateLi = `
                <li class="date">
                        <div class="date-info">
                            <p>${transactionDate}</p>
                            <div></div>
                            <p>${dailyResult}</p>
                        </div>
                        <ul>
                `;
            //Add all the code with all the transactions and close the ul and li prevoiusly opened
            dateLi += transactionsOfTheDay;
            dateLi += `
                </ul>
            </li>
            `;
            calendarContent += dateLi;
        });
        //populate html with all the information
        calendarList.innerHTML = calendarContent;
        //if is an empty object add empty class to calendar section and add text
    } else {
        calendarSection.classList.add('empty');
        calendarList.innerHTML = `<li>View in this section all your transactions organized by date.</br>
        Add all your incomes and expenses in the Add Section.</li>`;
    }
}

//Grupes transaction by type and category
function createBalanceData(arr) {
    let incomeObj = {};
    let expenseObj = {};
    let incomeAmount = 0;
    let expenseAmount = 0;
    incomedata = {};
    expensedata = {};
    //Iterates each object and gets necesary information
    arr.forEach(obj => {
        let transtype = obj.type;
        let transCat = obj.category;
        if (transtype === "income") {
            //check if category exists in income array, if it does it´s added, otherwise
            //its creates the category
            if (obj.category in incomeObj) {
                let oldAmount = incomeObj[transCat].amount;
                incomeObj[transCat].amount = oldAmount + obj.amount;
                incomeAmount += obj.amount;
            } else {
                incomeObj[transCat] = {
                    amount: obj.amount
                };
                incomeAmount += incomeObj[transCat].amount;
            }
        } else if (transtype === "expense") {
            //check if category exists in expense array, if it does it´s added, otherwise
            //its creates the category
            if (obj.category in expenseObj) {
                let oldAmount = expenseObj[transCat].amount;
                expenseObj[transCat].amount = oldAmount + obj.amount;
                expenseAmount += obj.amount;
            } else {
                expenseObj[transCat] = {
                    amount: obj.amount
                };
                expenseAmount += expenseObj[transCat].amount;
            }
        }
    });
    //adds percetage of each category in income and expense array
    Object.keys(incomeObj).forEach(key => {
        incomeObj[key].percentage = parseFloat(incomeObj[key].amount * 100 / incomeAmount).toFixed(2);
    });

    Object.keys(expenseObj).forEach(key => {
        expenseObj[key].percentage = parseFloat(expenseObj[key].amount * 100 / expenseAmount).toFixed(2);
    });

    //returns the data to the global scope
    sortBalanceObj(incomeObj, incomedata);
    sortBalanceObj(expenseObj, expensedata);
    incomeTotal = parseFloat(incomeAmount).toFixed(2);
    expenseTotal = parseFloat(expenseAmount).toFixed(2);
}

//Populate balance section with incomeData and expenseData
function populateBalance() {
    let finalBalance;

    if (parseFloat(incomeTotal) >= parseFloat(expenseTotal)) {
        finalBalance = `<span data-currency>${selectedCurrency}</span> <span data-amount>${parseFloat(incomeTotal - expenseTotal).toFixed(2)}</span>`;
    } else if (parseFloat(incomeTotal) < parseFloat(expenseTotal)) {
        finalBalance = `<span data-currency>-${selectedCurrency}</span> <span data-amount>${parseFloat(Math.abs(expenseTotal - incomeTotal)).toFixed(2)}</span>`;
    }
    let pieChartBalance = "";
    let balanceInfo = "";
    pieChartBalance += `
    <div class="pie-chart-result">
        <p><span data-currency>${selectedCurrency}</span> <span data-amount>${incomeTotal}</span></p>
        <p><span data-currency>-${selectedCurrency}</span> <span data-amount>${expenseTotal}</span></p>
        <hr>
        <p>${finalBalance}</p>
    </div>
    <svg height="20" width="20" viewBox="0 0 20 20">
        <circle r="10" cx="10" cy="10" fill="var(--blue)" />
    </svg>`;
    let incomeCurrentAngle = -90;
    let expenseCurrentAngle = -90;
    Object.keys(incomedata).forEach(key => {
        let incomeCategory = key;
        let noSpecialCaseCategory = incomeCategory.replace(/[^a-zA-Z]/g, "");
        let incomeAmount = incomedata[key].amount;
        let incomePercentage = incomedata[key].percentage;

        let incomeSvg = `
        <svg class="hide" data-add-category="${noSpecialCaseCategory}" data-add-type="income" height="20" width="20" viewBox="0 0 20 20" style="position: absolute; transform:rotate(${incomeCurrentAngle}deg)">
            <circle r="5" cx="10" cy="10" fill="transparent"
            stroke="var(--income-shade-${noSpecialCaseCategory})"
            stroke-width="10"
            stroke-dasharray="${parseFloat(incomePercentage * 31.42 / 100).toFixed(2)} 31.42" />
        </svg>
        `;
        let incomeElement = `
        <div data-add-category="${noSpecialCaseCategory}" data-add-type="income" class="percentage-element hide">
                <i class="${iconsObj[noSpecialCaseCategory]}"></i>
                <p class="category"> ${incomeCategory}</p>
                <p class="amount"><span data-currency>${selectedCurrency}</span> <span data-amount>${incomeAmount.toFixed(2)}</span></p>
                <p class="percentage">${incomePercentage}%</p>
            </div>
        `;

        incomeCurrentAngle += incomePercentage * 360 / 100;

        pieChartBalance += incomeSvg;
        balanceInfo += incomeElement;
    });

    Object.keys(expensedata).forEach(key => {
        let expenseCategory = key;
        let noSpecialCaseCategory = expenseCategory.replace(/[^a-zA-Z]/g, "");
        let expenseAmount = expensedata[key].amount;
        let expensePercentage = expensedata[key].percentage;

        let expenseSvg = `
        <svg class="hide" data-add-category="${noSpecialCaseCategory}" data-add-type="expense" height="20" width="20" viewBox="0 0 20 20" style="position: absolute; transform:rotate(${expenseCurrentAngle}deg)">
            <circle r="5" cx="10" cy="10" fill="transparent"
            stroke="var(--expense-shade-${noSpecialCaseCategory})"
            stroke-width="10"
            stroke-dasharray="${parseFloat(expensePercentage * 31.42 / 100).toFixed(2)} 31.42" />
        </svg>
        `;
        let expenseElement = `
        <div data-add-category="${noSpecialCaseCategory}" data-add-type="expense" class="percentage-element hide">
                <i class="${iconsObj[noSpecialCaseCategory]}"></i>
                <p class="category"> ${expenseCategory}</p>
                <p class="amount"><span data-currency>${selectedCurrency}</span> <span data-amount>${expenseAmount.toFixed(2)}</span></p>
                <p class="percentage">${expensePercentage}%</p>
            </div>
        `;

        expenseCurrentAngle += expensePercentage * 360 / 100;

        pieChartBalance += expenseSvg;
        balanceInfo += expenseElement;
    });

    pieChartContainer.innerHTML = pieChartBalance;
    pieChartInfo.innerHTML = balanceInfo;
}

//orders the object of objects by inner parameter
function sortBalanceObj(obj, selectedData) {
    Object.keys(obj).sort(function (a, b) {
        return obj[b].percentage - obj[a].percentage;
    }).forEach(function (key) {
        selectedData[key] = obj[key];
    });
}

//Delete element from calendar and change all data structures
calendarList.addEventListener('click', e => {
    //check that cross icon is being pressed
    if (e.target.classList.contains("movement-cross")) {
        //get timestamp from element id
        let transaction = e.target.parentNode;
        let selectedTimeStamp = parseInt(transaction.id.slice(2));

        //take all elements without the timestamp into a new array
        let newData = [];
        data.forEach(obj => {
            if (obj.timeStamp !== selectedTimeStamp) {
                newData.push(obj);
            }
        });
        //update data array and store in local storage
        data = newData;
        localStorage.setItem('data', JSON.stringify(data));

        //Repeat functions that create all data and populate sections
        dataByDate = sortObj(groupBy('date', data));
        populateCalendar(dataByDate);
        createBalanceData(data);
        populateBalance();

        if (addSection.classList.contains('income')) {
            balanceSection.classList.remove('expense');
            balanceSection.classList.add('income');
            deleteActive(balanceExpenseIncomeBtn);
            balanceExpenseIncomeBtn[0].classList.add('active');
            let balanceElements = document.querySelectorAll('[data-add-category]');
            hideElements(balanceElements);
            balanceElements.forEach(el => {
                if (el.getAttribute('data-add-type') === 'income') {
                    el.classList.remove('hide');
                }
            });
        } else if (addSection.classList.contains('expense')) {
            balanceSection.classList.remove('income');
            balanceSection.classList.add('expense');
            deleteActive(balanceExpenseIncomeBtn);
            balanceExpenseIncomeBtn[1].classList.add('active');
            let balanceElements = document.querySelectorAll('[data-add-category]');
            hideElements(balanceElements);
            balanceElements.forEach(el => {
                if (el.getAttribute('data-add-type') === 'expense') {
                    el.classList.remove('hide');
                }
            });
        }
    }
});

//get data from local storage and populate dom
function getData() {
    data = JSON.parse(localStorage.getItem('data')) || [];
    selectedCurrency = JSON.parse(localStorage.getItem('selectedCurrency')) || currency.value;
    markSelected("currency", selectedCurrency);
    selectedDecimal = JSON.parse(localStorage.getItem('selectedDecimal')) || decimal.value;
    markSelected("decimal", selectedDecimal);
    //Adds to the dataBy date transactions grouped by date and orders ir from most recent to oldestone
    dataByDate = sortObj(groupBy('date', data));
    //Populates the calendar section with the dataByDate
    populateCalendar(dataByDate);
    //Create data for expense and income transactions
    createBalanceData(data);
    //Populates the Balance section with the income and expense data
    populateBalance();

    //Adds selected currency to span in amount input
    document.querySelector('#add .input-container .input-box-amount [data-currency]').textContent = selectedCurrency;
    //Adds the selected decimal to the DOM
    changeDecimal(selectedDecimal);
}

//add selected value to selected decimal/percentage
function markSelected(id, selectedValue) {
    let select = document.getElementById(id);
    let options = select.querySelectorAll("option");
    options.forEach(option => {
        if (option.value === selectedValue) {
            option.setAttribute("selected", true);
        } else {
            option.removeAttribute("selected");
        }
    });
}

window.addEventListener('DOMContentLoaded', getData);

//check phone position (if in landscape trigger alert)
window.addEventListener('DOMContentLoaded', checkLandscapeMode);
function edit_item(id) {
    // Fetch item by id
    fetch(`edit/${id}`)
    .then(response => response.json())
    .then(data => {

        // Hide existing item content
        document.getElementById(`action_${data.item.id}`).hidden = true;
        document.getElementById(`deadline_${data.item.id}`).hidden = true;

        // Display edit fields and populate with current values
        document.getElementById(`edit_fields_${data.item.id}`).hidden = false;
        document.getElementById(`edit_action_${data.item.id}`).innerHTML = `<input autofocus required class="form-control" type="text" id="new_action_${data.item.id}" name="action" value="${data.item.action}" maxlength="28">`;
        document.getElementById(`edit_deadline_${data.item.id}`).hidden = false;

        let day = "";
        let month = "";
        let year = "";

        try {
            day = data.item.deadline[8] + data.item.deadline[9];
            month = data.item.deadline[5] + data.item.deadline[6];
            year = data.item.deadline[0] + data.item.deadline[1] + data.item.deadline[2] + data.item.deadline[3];
        } catch (error) {
            day = "";
            month = "";
            year = "";
        };

        document.getElementById(`edit_deadline_${data.item.id}`).innerHTML = `
            <select class="custom-select" id="new_day_${data.item.id}" name="day">
                <option ${day == "" ? "selected" : ""} value="">Day</option>
                <option ${day == "01" ? "selected" : ""} value="01">01</option>
                <option ${day == "02" ? "selected" : ""} value="02">02</option>
                <option ${day == "03" ? "selected" : ""} value="03">03</option>
                <option ${day == "04" ? "selected" : ""} value="04">04</option>
                <option ${day == "05" ? "selected" : ""} value="05">05</option>
                <option ${day == "06" ? "selected" : ""} value="06">06</option>
                <option ${day == "07" ? "selected" : ""} value="07">07</option>
                <option ${day == "08" ? "selected" : ""} value="08">08</option>
                <option ${day == "09" ? "selected" : ""} value="09">09</option>
                <option ${day == "10" ? "selected" : ""} value="10">10</option>
                <option ${day == "11" ? "selected" : ""} value="11">11</option>
                <option ${day == "12" ? "selected" : ""} value="12">12</option>
                <option ${day == "13" ? "selected" : ""} value="13">13</option>
                <option ${day == "14" ? "selected" : ""} value="14">14</option>
                <option ${day == "15" ? "selected" : ""} value="15">15</option>
                <option ${day == "16" ? "selected" : ""} value="16">16</option>
                <option ${day == "17" ? "selected" : ""} value="17">17</option>
                <option ${day == "18" ? "selected" : ""} value="18">18</option>
                <option ${day == "19" ? "selected" : ""} value="19">19</option>
                <option ${day == "20" ? "selected" : ""} value="20">20</option>
                <option ${day == "21" ? "selected" : ""} value="21">21</option>
                <option ${day == "22" ? "selected" : ""} value="22">22</option>
                <option ${day == "23" ? "selected" : ""} value="23">23</option>
                <option ${day == "24" ? "selected" : ""} value="24">24</option>
                <option ${day == "25" ? "selected" : ""} value="25">25</option>
                <option ${day == "26" ? "selected" : ""} value="26">26</option>
                <option ${day == "27" ? "selected" : ""} value="27">27</option>
                <option ${day == "28" ? "selected" : ""} value="28">28</option>
                <option ${day == "29" ? "selected" : ""} value="29">29</option>
                <option ${day == "30" ? "selected" : ""} value="30">30</option>
                <option ${day == "31" ? "selected" : ""} value="31">31</option>
            </select>
            /
            <select class="custom-select" id="new_month_${data.item.id}" name="month">
                <option ${month == "" ? "selected" : ""} value="">Month</option>
                <option ${month == "01" ? "selected" : ""} value="01">January</option>
                <option ${month == "02" ? "selected" : ""} value="02">February</option>
                <option ${month == "03" ? "selected" : ""} value="03">March</option>
                <option ${month == "04" ? "selected" : ""} value="04">April</option>
                <option ${month == "05" ? "selected" : ""} value="05">May</option>
                <option ${month == "06" ? "selected" : ""} value="06">June</option>
                <option ${month == "07" ? "selected" : ""} value="07">July</option>
                <option ${month == "08" ? "selected" : ""} value="08">August</option>
                <option ${month == "09" ? "selected" : ""} value="09">September</option>
                <option ${month == "10" ? "selected" : ""} value="10">October</option>
                <option ${month == "11" ? "selected" : ""} value="11">November</option>
                <option ${month == "12" ? "selected" : ""} value="12">December</option>
            </select>
            /
            <select class="custom-select" id="new_year_${data.item.id}" name="year">
                <option ${year == "" ? "selected" : ""} value="">Year</option>
                <option ${year == data.year ? "selected" : ""} value="${data.year}">${data.year}</option>
                <option ${year == data.next_year ? "selected" : ""} value="${data.next_year}">${data.next_year}</option>
            </select>
        `;
    });
}


function cancel_edit(id) {
    // Hide edit fields and clear populated values
    document.getElementById(`edit_fields_${id}`).hidden = true;
    document.getElementById(`edit_action_${id}`).innerHTML = '';
    document.getElementById(`edit_deadline_${id}`).hidden = true;
    document.getElementById(`edit_deadline_${id}`).innerHTML = '';

    // Display previous item action and deadline
    document.getElementById(`action_${id}`).hidden = false;
    document.getElementById(`deadline_${id}`).hidden = false;
}


function save_edit(id) {
    // Get CSRF token
    const csrfToken = document.getElementById(`save_${id}`).getAttribute('data-csrf');

    // Check action is not left blank
    new_action = document.getElementById(`new_action_${id}`).value;
    if (new_action.length == 0) {
        document.getElementById(`new_action_${id}`).placeholder = "***Do not leave blank***";
        return
    }

    // Save new item action and deadline
    new_day = document.getElementById(`new_day_${id}`).value;
    new_month = document.getElementById(`new_month_${id}`).value;
    new_year = document.getElementById(`new_year_${id}`).value;

    fetch(`edit/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
          },
        body: JSON.stringify({
            "action": new_action,
            "day": new_day,
            "month": new_month,
            "year": new_year
        })
    })
    .then(response => response.json())
    .then(item => {

        // Check for error messages
        if (item.error) {
            alert(item.error);
        } else {

            // Hide edit fields and clear populated values
            document.getElementById(`edit_fields_${item.id}`).hidden = true;
            document.getElementById(`edit_deadline_${item.id}`).hidden = true;
            document.getElementById(`edit_action_${item.id}`).innerHTML = '';
            document.getElementById(`edit_deadline_${item.id}`).innerHTML = '';

            // Display new item action and deadline
            let deadline = "";

            try {
                deadline = item.deadline[8] + item.deadline[9] + "/" + item.deadline[5] + item.deadline[6];
            } catch (error) {
                deadline = "~";
            }

            document.getElementById(`action_${item.id}`).innerHTML = `${item.action}`;
            document.getElementById(`deadline_${item.id}`).innerHTML = `${deadline}`;
            document.getElementById(`action_${item.id}`).hidden = false;
            document.getElementById(`deadline_${item.id}`).hidden = false;
        }
    });
}


function delete_item(id) {
    // Get CSRF token and delete item
    const csrfToken = document.getElementById(`delete_${id}`).getAttribute('data-csrf');

    fetch(`delete/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
        }
    })
    .then(response => response.json())
    .then(item => {

        // Run animation and delete item row
        const row = document.getElementById(`item_row_${item.id}`);
        row.style.animationPlayState = 'running';
        row.addEventListener('animationend', () => {
            row.remove();
        });
    });
}

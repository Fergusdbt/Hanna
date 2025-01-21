// Wait until the DOM content to get current date
document.addEventListener('DOMContentLoaded', save_date())


function save_date() {
    // Fetch current date
    fetch('date')
    .then(response => response.json())
    .then(date => {

        // Separate values for day, month, year and next year
        const day = date.day;
        const month = date.month;
        const year = date.year;
        const next_year = year + 1;

        // Save data in session storage for quick access to current date
        sessionStorage.setItem("day", day);
        sessionStorage.setItem("month", month);
        sessionStorage.setItem("year", year);
        sessionStorage.setItem("next_year", next_year);

        // Get UK Bank Holidays
        save_holidays()
    });
}


function save_holidays() {
    // Get current date from session storage
    const day = Number(sessionStorage.getItem("day"));
    const month = Number(sessionStorage.getItem("month"));
    const year = Number(sessionStorage.getItem("year"));
    const next_year = Number(sessionStorage.getItem("next_year"));

    // Fetch dates for UK Bank Holidays
    fetch('https://www.gov.uk/bank-holidays.json')
    .then(response => response.json())
    .then(holidays => {

        // Filter England and Wales holidays for current year and next year
        let eng_wal = holidays['england-and-wales'];
        eng_wal = eng_wal.events.filter(event => {
            const event_year = new Date(event.date).getFullYear();
            return event_year == year || event_year == next_year;
        })

        // Filter Northern Ireland holidays for current year and next year
        let nor_ire = holidays['northern-ireland'];
        nor_ire = nor_ire.events.filter(event => {
            const event_year = new Date(event.date).getFullYear();
            return event_year == year || event_year == next_year;
        })

        // Filter Scotland holidays for current year and next year
        let scotland = holidays['scotland'];
        scotland = scotland.events.filter(event => {
            const event_year = new Date(event.date).getFullYear();
            return event_year == year || event_year == next_year;
        })

        // Save data in session storage for quick access to UK Bank Holidays
        sessionStorage.setItem("eng_wal", JSON.stringify(eng_wal));
        sessionStorage.setItem("nor_ire", JSON.stringify(nor_ire));
        sessionStorage.setItem("scotland", JSON.stringify(scotland));

        // Load page for current year
        view_current_year()
    });
}


function view_current_year() {

    // Get current date from session storage
    const day = Number(sessionStorage.getItem("day"));
    const month = Number(sessionStorage.getItem("month"));
    const year = Number(sessionStorage.getItem("year"));
    const next_year = Number(sessionStorage.getItem("next_year"));

    // Update month selectors to view calendar months for this year
    for (let i = 1; i <= 12; i++) {
        let selector = document.getElementById(`month-${i}`);
        selector.onclick = () => view_month(year, i);
    }

    // Populate, enable and display button to view calendar months for next year
    let next = document.getElementById('next-year');
    next.innerHTML = `${next_year} >>>`;
    next.onclick = () => view_next_year();
    next.style.visibility = "visible";

    // Populate and hide button to view calendar months for previous year
    let previous = document.getElementById('previous-year');
    previous.innerHTML = `<<< ${year}`;
    previous.style.visibility = "hidden";

    // By default, load calendar view for current date
    view_month(year, month);
}


function view_month(year, month) {
    // Reset month selectors
    for (let i = 1; i <= 12; i++) {
        let button = document.getElementById(`month-${i}`);
        button.className = "btn btn-outline-secondary";
        button.disabled = false;
    }

    // Highlight and disable selected month
    let selected_button = document.getElementById(`month-${month}`);
    selected_button.className = "btn btn-secondary";
    selected_button.disabled = true;

    // Populate calendar title
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month_name = months[month - 1];
    document.getElementById('month').innerHTML = `Calendar: ${month_name} ${year}`;

    // Reset cells in calendar template
    let calendar = document.getElementById('calendar');
    let rows = calendar.querySelectorAll('.row');
    let cells = calendar.querySelectorAll('.col');

    cells.forEach((cell) => {
        // Reset border
        cell.style.border = 'solid 0.5px grey';
        cell.onclick = "";
        cell.hidden = false;

        // Clear date and styling
        let date = cell.querySelector('.date');
        date.innerHTML = '';
        date.style.color = 'black';

        // Clear header
        let header = cell.querySelector('.header');
        header.innerHTML = '';

        // Clear event
        let body = cell.querySelector('.body');
        body.innerHTML = '';

        // Clear footer
        let footer = cell.querySelector('.footer');
        footer.innerHTML = '';
    });

    // Get UK Bank Holidays from session storage
    let eng_wal = JSON.parse(sessionStorage.getItem("eng_wal"));
    let nor_ire = JSON.parse(sessionStorage.getItem("nor_ire"));
    let scotland = JSON.parse(sessionStorage.getItem("scotland"));

    // Filter England and Wales holidays for given year and month
    eng_wal = eng_wal.filter(event => {
        const event_date = new Date(event.date);
        const event_year = event_date.getFullYear();
        const event_month = event_date.getMonth() + 1;
        return event_year == year && event_month == month;
    })

    // Filter Northern Ireland holidays for given year and month
    nor_ire = nor_ire.filter(event => {
        const event_date = new Date(event.date);
        const event_year = event_date.getFullYear();
        const event_month = event_date.getMonth() + 1;
        return event_year == year && event_month == month;
    })

    // Filter Scotland holidays for given year and month
    scotland = scotland.filter(event => {
        const event_date = new Date(event.date);
        const event_year = event_date.getFullYear();
        const event_month = event_date.getMonth() + 1;
        return event_year == year && event_month == month;
    })

    // Fetch dates for calendar month
    fetch(`month/${year}/${month}`)
    .then(response => response.json())
    .then(calendar_month => {

        // Get current date from session storage
        const current_day = Number(sessionStorage.getItem("day"));
        const current_month = Number(sessionStorage.getItem("month"));
        const current_year = Number(sessionStorage.getItem("year"));

        // Assign content to each date in calendar month
        cells.forEach((cell, index) => {
            // Get calendar cell sections
            let date = cell.querySelector('.date');
            let header = cell.querySelector('.header');
            let body = cell.querySelector('.body');
            let footer = cell.querySelector('.footer');

            // Add date
            if (calendar_month.days[index] != 0 && calendar_month.days[index] != null) {
                date.innerHTML = `${calendar_month.days[index]}`;

                // Add styling to current date if in calendar
                if (year == current_year && month == current_month && calendar_month.days[index] == current_day) {
                    date.style.color = 'red';
                    cell.style.border = 'solid 1px red';
                }

                // Check for England and Wales holidays in the month and add title to date cell header
                eng_wal.forEach((holiday) => {
                    let holiday_date = new Date(holiday.date);
                    let holiday_day = holiday_date.getDate();
                    if (calendar_month.days[index] == holiday_day) {
                        header.innerHTML = `${holiday.title}`;
                    }
                });

                // Check for Northern Ireland holidays in the month and add title to date cell header
                nor_ire.forEach((holiday) => {
                    let holiday_date = new Date(holiday.date);
                    let holiday_day = holiday_date.getDate();
                    if (calendar_month.days[index] == holiday_day && header.innerHTML == "") {
                        header.innerHTML = `${holiday.title} (NI)`;
                    }
                });

                // Check for Scotland holidays in the month and add title to date cell header
                scotland.forEach((holiday) => {
                    let holiday_date = new Date(holiday.date);
                    let holiday_day = holiday_date.getDate();
                    if (calendar_month.days[index] == holiday_day && header.innerHTML == "") {
                        header.innerHTML = `${holiday.title} (Scot)`;
                    }
                });

                // Fetch user actions from to do list for each date
                const formatted_date = `${year}-${month}-${calendar_month.days[index]}`;
                fetch(`actions/${formatted_date}`)
                .then(response => response.json())
                .then(data => {

                    // Add actions to date cell footer
                    const actions = data.items;
                    if (actions.length > 1) {
                        footer.innerHTML = "See 'To Do' for deadlines!"
                    } else {
                        for (action of actions) {
                            footer.innerHTML += `${action.action}!<br>`;
                        }
                    }
                });

                // Fetch user event from database for each date
                fetch(`event/${formatted_date}`)
                .then(response => response.json())
                .then(data => {
                    // Add event to date cell body
                    const event = data.event;
                    if (event) {
                        body.innerHTML = `${event.event}`;
                    }
                });

                // Add event listener to cell to edit event content
                cell.onclick = () => edit_event(formatted_date, cell, body);
            }
            // Hide bottom row if unused
            if (calendar_month.days[index] == null) {
                cell.hidden = true;
            }
        });

        // Run animation to fade in calendar content
        load_animation()
    });
  }


function edit_event(date, cell, body) {
    // Replace cell body content with editable textarea
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const event = body.innerHTML;
    body.innerHTML = `<textarea autofocus name="event" id="edit_field" placeholder="Add event here..." maxlength="24" rows="2" cols="8" data-csrf="${csrfToken}">${event}</textarea>`;

    // Change cell onclick property to save changes
    cell.onclick = (event) => {
        if (event.target != body.querySelector('#edit_field')) {
            save_event(date, cell, body);
        }
    }
}


function save_event(date, cell, body) {
    // Get CSRF token and new event description
    const edit_field = body.querySelector('#edit_field');
    const csrfToken = edit_field.getAttribute('data-csrf');
    const new_event = edit_field.value;

    // Update new event in database
    fetch(`event/${date}`, {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({
            "event": new_event
        })
    })
    .then(response => response.json())
    .then(data => {

        // Replace cell body content with saved event
        if (data.message) {
            body.innerHTML = "";
        }
        else {
            const event = data.event.event;
            body.innerHTML = `${event}`;
        }
    });

    // Change cell onclick property to edit changes
    cell.onclick = () => edit_event(date, cell, body);
}


function view_next_year() {
    // Enable and display button to view calendar months for previous year
    let previous = document.getElementById('previous-year');
    previous.onclick = () => view_current_year();
    previous.style.visibility = "visible";

    // Hide button to view calendar months for next year
    document.getElementById('next-year').style.visibility = "hidden";

    // Get value for next year from session storage
    const next_year = Number(sessionStorage.getItem("next_year"))

    // Update month selectors to view calendar months for next year
    for (let i = 1; i <= 12; i++) {
        let selector = document.getElementById(`month-${i}`);
        selector.onclick = () => view_month(next_year, i);
    }

    // By default, load calendar view for January next year
    view_month(next_year, 1)
};


function load_animation() {
    // Reset and run animation to fade in calendar content
    const calendar = document.getElementById('calendar');
    calendar.style.animation = 'none';
    calendar.offsetHeight;
    calendar.style.animation = 'fade-in 1s forwards';
    calendar.style.animationPlayState = 'running';
    calendar.addEventListener('animationiteration', () => {
        calendar.style.animationPlayState = 'paused';
    });
}

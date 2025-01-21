export function page_view(view) {
    // Hide each page view
    const pages = ["inbox", "outbox", "send", "friends"];
    for (let page of pages) {
        document.querySelector(`#${page}-view`).style.display = 'none';

        // Reset styling for each page button
        let button = document.getElementById(page)
        button.className = "btn btn-outline-secondary";
        button.disabled = false;
    }

    // Highlight and disable selected page button
    let selected_button = document.getElementById(`${view}`);
    selected_button.className = "btn btn-secondary";
    selected_button.disabled = true;

    // Display requested page view
    document.querySelector(`#${view}-view`).style.display = 'block';

    // If mailbox view, add page title
    if (view == "inbox" || view == "outbox" ) {
        document.querySelector(`#${view}-view`).innerHTML = `<h4 class="centered">${view.charAt(0).toUpperCase() + view.slice(1)}</h4>`;
    }

    return;
}


export function load_animation(view) {
    // Reset and run animation to fade in page content
    const page = document.getElementById(`${view}-view`);
    page.style.animation = 'none';
    page.offsetHeight;
    page.style.animation = 'fade-in 1s forwards';
    page.style.animationPlayState = 'running';
    page.addEventListener('animationiteration', () => {
        page.style.animationPlayState = 'paused';
    });
}


export function format_date(input) {
    // Create date object and get components
    const date = new Date(input);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Return formatted date
    let formatted_date;
    if (hours == 0 && minutes == 0) {
        formatted_date = `${day}/${month}/${year}`;
    }
    else {
        formatted_date = `${hours}:${minutes} ${day}/${month}/${year}`;
    }
    return formatted_date;
}

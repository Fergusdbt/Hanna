// Import util.js
import * as utils from './utils.js';

// Declare global variables
let debounceTimeout;

document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between page views
    document.querySelector('#inbox').addEventListener('click', load_inbox);
    document.querySelector('#outbox').addEventListener('click', load_outbox);
    document.querySelector('#send').addEventListener('click', new_invite);
    document.querySelector('#friends').addEventListener('click', view_friends);

    // Listen for submission of new invite form
    document.querySelector('#send-form').addEventListener('submit', send_invite);

    // Listen for inputs in user search field
    document.querySelector('#search-user').addEventListener('input', search_results);

    // By default, load the inbox view
    load_inbox();
  });


function load_inbox() {
    // Display page view
    utils.page_view('inbox')

    // Get CSRF token for checkbox responses
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Fetch invites by mailbox
    fetch('mail/inbox')
    .then(response => response.json())
    .then(invites => {

        // Check for message
        if (invites.message) {
            let message = document.createElement('div');
            message.className = 'centered';
            message.innerHTML = `<h6>${invites.message}</h6>`;

            // Append message to page view
            document.getElementById('inbox-view').append(message);
        } else {
            // Create mailbox item for each invite
            invites.forEach(invite => {

                // Reformat the event date
                const date = utils.format_date(invite.event.date);

                // Populate contents
                let mail = document.createElement('div');
                mail.className = 'container-fluid mail';
                mail.innerHTML = `
                    <div class="row">
                        <div class="col-5">
                            <strong>Event:</strong><br>${invite.event.event}
                        </div>
                        <div class="col-3">
                            <strong>Date:</strong><br>${date}
                        </div>
                        <div class="col-2">
                            <strong>From:</strong><br>${invite.user.username}
                        </div>
                        <div class="col-2">
                            <strong>Accept:</strong><br><input type="checkbox" id="checkbox" data-csrf="${csrfToken}" ${invite.accepted ? "checked" : ""}>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <strong>Details:</strong><br>${invite.details}
                        </div>
                    </div>
                `;

                // Add event listener to 'accepted' checkbox
                mail.querySelector('#checkbox').addEventListener('change', () => invite_response(invite.id));

                // Assign CSS styling based on accepted status
                mail.id = invite.accepted ? 'accepted' : 'pending';

                // Append mailbox item to page view
                document.querySelector('#inbox-view').append(mail);
            });
        }
        // Run animation to fade in page content
        utils.load_animation('inbox')
    });
}


function invite_response(id) {
    // Get CSRF token
    const checkbox = event.target;
    const csrfToken = checkbox.getAttribute('data-csrf');

    // Determine response status
    let response;
    if (checkbox.checked) {
        response = "accepted"
    } else {
        response = "pending"
    }

    // Send invite response
    fetch('invite_response', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({
          "id": id,
          "response": response
        })
    })
    .then(response => response.json())
    .then(data => {

        // Update CSS styling based on accepted status
        let mail = checkbox.closest('.mail');
        if (data.message == "accepted") {
            mail.id = "accepted"
        } else {
            mail.id = "pending"
        }
    });
}


function load_outbox() {
    // Display page view
    utils.page_view('outbox')

    // Fetch invites by mailbox
    fetch('mail/outbox')
    .then(response => response.json())
    .then(invites => {

        // Check for message
        if (invites.message) {
            let message = document.createElement('div');
            message.className = 'centered';
            message.innerHTML = `<h6>${invites.message}</h6>`;

            // Append message to page view
            document.getElementById('outbox-view').append(message);
        } else {
            // Create mailbox item for each invite
            invites.forEach(invite => {

                // Reformat the event date
                const date = utils.format_date(invite.event.date);

                // Reformat the invite timestamp
                const timestamp = utils.format_date(invite.timestamp);

                // Populate contents
                let mail = document.createElement('div');
                mail.className = 'container-fluid mail';
                mail.innerHTML = `
                    <div class="row">
                    <div class="col-2">
                        <strong>To:</strong><br>${invite.recipient.username}
                    </div>
                    <div class="col-3">
                        <strong>Event:</strong><br>${invite.event.event}
                    </div>
                    <div class="col-2">
                        <strong>Date:</strong><br>${date}
                    </div>
                    <div class="col-2">
                        <strong>Sent:</strong><br>${timestamp}
                    </div>
                    <div class="col-3">
                        <strong>Response:</strong><br>${invite.accepted ? "Accepted!" : "Pending..."}
                    </div>
                    </div>
                `;

                // Assign CSS styling based on accepted status
                mail.id = invite.accepted ? 'accepted' : 'pending';

                // Append mailbox item to page view
                document.querySelector('#outbox-view').append(mail);
            });
        }
        // Run animation to fade in page content
        utils.load_animation('outbox')
    });
}


function new_invite() {
    // Display page view
    utils.page_view('send')

    // Clear recipients
    let recipients = document.querySelector('#recipients');
    recipients.innerHTML = "";

    // Fetch user's accepted friends
    fetch('friends_list')
    .then(response => response.json())
    .then(data => {
        const friends = data.accepted_friends;

        // Add message if no friends available
        if (friends.length == 0) {
            let message = document.createElement('option');
            message.disabled = true;
            message.innerHTML = 'No friends yet!';
            recipients.appendChild(message);
        } else {
            // List each username
            friends.forEach(friend => {
                let name = document.createElement('option');
                name.value = `${friend.id}`;
                name.innerHTML = `${friend.username}`;
                recipients.appendChild(name);
            })
        }
    });

    // Clear events list
    let events = document.querySelector('#event');
    events.innerHTML = "";

    // Fetch user's events
    fetch('events')
    .then(response => response.json())
    .then(data => {
        const list = data.events_list;

        // Add message if no events are available
        if (list.length == 0) {
            const message = document.createElement('option');
            message.disabled = true;
            message.innerHTML = `${data.message}`;
            events.appendChild(message);
        } else {
            // Add header to list of options
            const header = document.createElement('option');
            header.selected = true;
            header.disabled = true;
            header.innerHTML = "Events from calendar";
            events.appendChild(header);

            // Add each event to events list
            list.forEach(event => {
                const date = utils.format_date(event.date)
                const option = document.createElement('option');
                option.value = `${event.id}`;
                option.innerHTML = `${event.event} (${date})`;
                events.appendChild(option);
            });
        }
        // Run animation to fade in page content
        utils.load_animation('send')
    });
}


function send_invite() {
    // Prevent default form handling
    event.preventDefault();

    // Get CSRF token
    const send_form = document.getElementById('send-form')
    const csrfToken = send_form.querySelector('input[name="csrfmiddlewaretoken"]').value;

    // Store values of send invite form fields
    const selected_recipients = Array.from(document.querySelector('#recipients').selectedOptions);
    const recipient_IDs = selected_recipients.map(selected_recipient => ({
        id: selected_recipient.value
    }));
    const event_id = document.querySelector('#event').selectedOptions[0].value;
    const event_details = document.querySelector('#details').value;

    // Send invite
    fetch('send_invite', {
    method: 'POST',
    headers: {
        "Content-Type": 'application/json',
        "X-CSRFToken": csrfToken
    },
    body: JSON.stringify({
      "recipient_IDs": recipient_IDs,
      "event_id": event_id,
      "event_details": event_details
    })
    })
    .then(response => response.json())
    .then(data => {

        // Log any error messages in console
        if (data.error) {
            console.log(data.error);
        } else {
            // Otherwise, log success message and load outbox
            console.log(data.message);
            load_outbox();
        };
    });
}


function view_friends() {
    // Display page view
    utils.page_view('friends')

    // Clear friend requests
    let friend_requests = document.querySelector('#friend-requests');
    friend_requests.innerHTML = "";

    // Clear friends list
    let friends_list = document.querySelector('#friends-list');
    friends_list.innerHTML = "";

    // Clear the search field
    let search = document.querySelector('#search-user');
    search.value = "";

    // Clear search results
    let search_results = document.querySelector('#search-results');
    search_results.innerHTML = "";

    // Fetch user's friends, including pending friends
    fetch('friends_list')
    .then(response => response.json())
    .then(data => {
        const accepted_friends = data.accepted_friends;
        const pending_friends = data.pending_friends;
        const friends = accepted_friends.concat(pending_friends);

        // Add message if no friends available
        if (friends.length == 0) {
            let message = document.createElement('div');
            message.className = 'centered';
            message.innerHTML = '<h6>No friends yet!</h6>';
            friends_list.appendChild(message);
        } else {
            // Get CSRF token for 'remove' friend button
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // List each friend
            friends.forEach(friend => {
                let name = document.createElement('div');
                name.className = 'name';
                name.id = `name_${friend.id}`;
                name.innerHTML = `
                    <div class="row">
                        <div class="col-7">
                            <h4>${friend.username}</h4>
                        </div>
                        <div class="col-3">
                        ${friend.accepted ? '' : '(pending)'}
                        </div>
                        <div class="col-2">
                            <button class="btn ${friend.accepted ? 'btn-red' : 'btn-blue'}" id="remove_friend" data-csrf="${csrfToken}">&#10005;</button>
                        </div>
                        <hr>
                    </div>
                `;

                // Add event listener to 'remove' friend button
                name.querySelector('#remove_friend').addEventListener('click', () => friend_update(friend.id));

                // Append name to friends list
                friends_list.appendChild(name);
            });
        }

        // Check for friend requests
        const requests = data.friend_requests
        const n = requests.length;
        if (requests.length > 0) {

            // Get CSRF token for 'add' friend button
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // List each user
            friend_requests.innerHTML = `<h4 class="centered">You have ${n} friend ${n == 1 ? 'request' : 'requests' } pending...</h4>`;
            requests.forEach(person => {
                let name = document.createElement('div');
                name.className = 'request';
                name.id = `name_${person.id}`;
                name.innerHTML = `
                    <div class="row">
                        <div class="col-7">
                            <h4>${person.username}</h4>
                        </div>
                        <div class="col-5">
                            <button class="btn btn-green" id="accept_${person.id}" data-csrf="${csrfToken}">Accept</button>
                            <button class="btn btn-red" id="decline_${person.id}" data-csrf="${csrfToken}">Ignore</button>
                        </div>
                        <hr>
                    </div>
                `;

                // Add event listener to 'accept' and 'decline' buttons
                name.querySelector(`#accept_${person.id}`).addEventListener('click', () => request_response(person.id));
                name.querySelector(`#decline_${person.id}`).addEventListener('click', () => request_response(person.id));

                // Append name to friend requests
                friend_requests.appendChild(name);
            });
        }
    });
    // Run animation to fade in page content
    utils.load_animation('friends')
}


function search_results() {
    // Clear search results
    let search_results = document.querySelector('#search-results');
    search_results.innerHTML = "";

    // Check if query is empty
    const query = document.querySelector('#search-user').value;
    if (query == "") {
        return;
    }

    // Reset the delay time after user stops typing
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {

        // Fetch user search results
        fetch(`users/${query}`)
        .then(response => response.json())
        .then(data => {

            // Add message if search result is empty
            if (data.message) {
                let message = document.createElement('div');
                message.className = 'name';
                message.innerHTML = `<h6>${data.message}</h6>`;
                search_results.appendChild(message);
            } else {

                // Get CSRF token for 'add' friend button
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // List each user
                const user_list = data.user_list
                user_list.forEach(person => {
                    let result = document.createElement('div');
                    result.className = 'name';
                    result.id = `name_${person.id}`;
                    result.innerHTML = `
                        <div class="row">
                            <div class="col-9">
                                <h4>${person.username}</h4>
                            </div>
                            <div class="col-3">
                                <button class="btn btn-green" id="add_friend" data-csrf="${csrfToken}">Add</button>
                            </div>
                            <hr>
                        </div>
                    `;

                    // Add event listener to 'add' friend button
                    result.querySelector('#add_friend').addEventListener('click', () => friend_update(person.id));

                    // Append name to search results
                    search_results.appendChild(result);
                });
            }
        });
    // Set delay time (milliseconds)
    }, 300);
}


function friend_update(id) {
    // Get CSRF token
    const button = event.target;
    const csrfToken = button.getAttribute('data-csrf');

    // Update friend table
    fetch(`friend_update/${id}`, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {

        // If old friend, remove name from friends list
        if (data.old_friend) {
            const old_friend = data.old_friend.friend
            let name = document.querySelector(`#name_${old_friend.id}`);
            name.remove();
        } else {

            // If new friend, remove name from list
            const friend = data.new_friend.friend
            let result = document.querySelector(`#name_${friend.id}`);
            result.remove();

            // Get CSRF token for 'remove' friend button
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // Add user to friends list
            let name = document.createElement('div');
            name.className = 'name';
            name.id = `name_${friend.id}`;
            name.innerHTML = `
                <div class="row">
                    <div class="col-7">
                        <h4>${friend.username}</h4>
                    </div>
                    <div class="col-3">
                        (pending)
                        </div>
                    <div class="col-2">
                        <button class="btn btn-blue" id="remove_friend" data-csrf="${csrfToken}">&#10005;</button>
                    </div>
                    <hr>
                </div>
            `;

            // Add event listener to 'remove' friend button
            name.querySelector('#remove_friend').addEventListener('click', () => friend_update(friend.id));

            // Append name to friends list
            let friends_list = document.querySelector('#friends-list');
            friends_list.appendChild(name);

            // Check if friend requests has been emptied, and update header if so
            let friend_requests = document.querySelector('#friend-requests');
            if (friend_requests.children.length == 1) {
                friend_requests.innerHTML = '<h4 class="centered">Friend request(s) sent!</h4>';
            }
        }
    });
}


function request_response(id) {
    // Get CSRF token
    let button = event.target;
    const csrfToken = button.getAttribute('data-csrf');

    // Get button ID
    const button_ID = button.getAttribute('id');

    // Update friend table
    fetch(`request_response/${id}`, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({
          "button_ID": button_ID
        })
    })
    .then(response => response.json())
    .then(data => {

        // If declined, remove accept button
        if (data.message == "Declined") {
            const accept = document.querySelector(`#accept_${id}`);
            accept.remove();

            // Update buttons to confirm friend request declined
            button.innerHTML = 'Request ignored';
            button.disabled = true;
        } else {

            // If accepted, remove decline button
            const decline = document.querySelector(`#decline_${id}`);
            decline.remove();

            // If unreciprocated, provide button to add as friend in return
            if (data.message == "Accepted & unreciprocated") {
                parent = button.parentElement;
                parent.innerHTML = `<button class="btn btn-success" id="add_friend" data-csrf="${csrfToken}">Add as friend</button>`;
                parent.querySelector('#add_friend').addEventListener('click', () => friend_update(id));
            } else {

                // If reciprocated, update button to confirm friend request accepted
                button.innerHTML = 'Request accepted';
                button.disabled = true;
           }
        }
    });
}

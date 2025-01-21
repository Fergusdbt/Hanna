# HANNA THE PLANNER
#### Video Demo: https://youtu.be/N0VP5WX0Lb8
#### Description: A digital planner that includes three applications; a to do list, a calendar and an invitation manager
#### Command: python manage.py runserver

#### Distinctiveness and Complexity:
This project, Hanna, utilises Django to run three web applications:

* TO DO LIST: an action items organiser
* CALENDAR: a dynamic digital calendar
* INVITES: an event invitation manager

 Each of these apps have separate front-ends with distinct JavaScript, whilst using Django to manage the back-end, they share access to an SQL database with a total of five models across the project. Central to the project is the CALENDAR application, which is a single-page application that dynamically populates a calendar template based on the selected month and year and pulls data from the TO DO LIST application to add action item deadlines to the calendar, and from the INVITES application to add accepted event invitations from other users to the calendar as well.

 The idea behind this is to provide users with one-stop digital planner for your personal life, which also allows close friends and family to suggest adding events to your calendar, provided they are also users and their friend requests are accepted. The design and user experience is clean and simple, and importantly, all apps are mobile responsive allowing users to access and update their plans whilst on the move.


#### HOME:
This project includes a fourth application, called HOME, which manages the user registration and log in process, and once users are logged in, it acts as a landing page to access any one of the three applications described above. This uses the 'Users' model provided by Django authentication.

Key files in this application are as follows:

* layout.html - The layout template is unique for each application as they access different static files
* register.html & login.html - These are separate pages that provide the necessary forms for the user to register and log in respectively
* index.html - This is the landing page which includes navigation links to each of the three web applications, as well as a logout button
* styles.css - The CSS styling supports Bootstrap and is unique for each application and includes responsive styling and animations to enhance UI/UX
* decorators.py - A 'login required' decorator has been defined here and is used throughout other applications to ensure the user is logged in
* views.py - Defines the login, logout and register views and validates the form requests via POST, whilst managing error messages as needed


#### TO DO LIST:
This is a single-page web application that allows users to add to, edit and tick off a personal 'To do' list. A text form field at the top of the page allows users to add a new action, with an optional select field to include a deadline date for the action. The selected date is validated to ensure the date exists, and if any error is found, the deadline will be null. If the deadline date has already passed an error message will be shown.

Once added to the list, action items are displayed in chronological order, with the most urgent actions displayed at the top and actions without deadlines displayed at the bottom. All action descriptions and deadlines can be edited using the buttons provided, which utilise JavaScript to make updates directly to the DOM and to the SQL database via an API route. This accesses the 'Item' model which describes each item object, including a user, an action and a deadline. The UI/UX has been enhanced by using a subtle animation when marking an action as done, providing a satisfying fade out, with other actions gliding up to fill the space.

Key files in this application are as follows:

* index.html - Uses Jinja syntax to populate the HTML page with the action items, as well as hidden content to be used for editing purposes
* todo.js - Supports the editing functionality, hiding content and displaying populated form fields to be updated and saved, and running animations
* views.py - Uses the python datetime import to validate deadline dates and update the Item model via POST and renders the HTML page via GET
* models.py - Defines the Item model, which allows deadline to be optional, and limits the action to 28 characters to support calendar layout
* styles.css - Manages 'delete' animation using keyframes to reduce opacity and subsequently reduce height, among other styles features


#### CALENDAR:
Due to a conflict with existing Django application file naming, the CALENDAR application is referred to as 'planner' within the file structure.

This is a single-page application that provides the user with a calendar template and navigation buttons to view dates for a particular month. The app dynamically gets the current date and provides the months for both the current calendar year and the next calendar year, allowing users to plan far in advance, even as the the year is coming to an end. The template is populated automatically, given the selected month, to display UK bank holidays, actions with deadline dates from the TO DO app, and saved events, which can be added to via the INVITES app. The user can also edit the calendar directly to create new events and alter existing ones.

The UK bank holidays are accessed via an API to 'https://www.gov.uk/bank-holidays.json' and saved in session storage as soon as the DOM content has loaded. The same is done for the current date, as both this and the UK bank holidays will need to be accessed regularly. This current date is first used on loading the DOM content, as the user is automatically taken to the current month view, and the current date cell in the calendar template is highlighted red.

Each cell within the calendar template is structured within the HTML to have designated setions for the content depending on the source, e.g. holidays, deadlines and events. This supports the clean layout of content, and combined with maximum character limits, ensures content does not overflow.

Key files in this application are as follows:

* index.html - This file defines the structure for the calendar template, but contains limited content, as it will be populated by JavaScript
* planner.js - After saving today's date and holidays, this file defines functions to view a given month and year, populating the calendar template
* views.py - Uses the python calendar import to get weekday patterns for each month, and accesses the Event model to manage calendar and edits
* models.py - Defines the Event model, and ensures the every object must have a unique user and date to ensure a clean calendar view
* styles.css - Manages 'fade-in' animation to load pages smoothly, and makes the weekday headers sticky to support scrolling on smaller screens


#### INVITES:
This is a single-page application that allows users to add other users as 'friends', send them invitations to their own existing calendar events, view their outbox for invitations they have sent and whether they have been accepted, and view their inbox to see any invitations they might have received themselves. When invitations are accepted, they are added to the database as an event, and therefore will display in the user's CALENDAR app. Any conflicts with existing events are resolved, by updating the existing event description with an additional note.

Users can navigate using buttons to view one of four pages; an inbox, an outbox, a page to send invitations and a page to manage friends. The mailbox pages use conditional styling to colour-code the mail, clearly highlighting which invites have been accepted. Mailboxes do not display mail related to events that have already happened, but these continue to be stored on the database. The 'send' page is a simple form which allows users to select multiple recipients from accepted friends, select a single event from their own calendar, and add further details to explain more about the event and the reason they are sharing it as needed.

Finally, the 'friends' page is populated with a list of existing friends, including those who have been sent friend requests, but are pending. If the user has received any friend requests of their own, these will be displayed at the top of the page, with options to accept or ignore. If the user chooses to accept, and hasn't already added the other user as a friend themselves, they will be prompted to do so with a button to add them as a friend in return. Other users can be added by searching for their username in the search field at the bottom of the page, which uses JavaScript to provide immediate results for partial searches.

Key files in this application are as follows:

* index.html - Provides placeholder views for mailboxes to be populated by JavaScript, and populates forms only for 'send' and 'friends' pages
* utils.js - Exports repeated functions to invites.js to keep code clean, includes setting up page views, formatting the date and running animations
* invites.js - As well as populating page content, this file also manages sending invites and user responses, depending whether it has been accepted
* views.py - Accesses the SQL database, including new models for 'Friend' and 'Invite' objects, as well as the 'Event' model from the CALENDAR app
* models.py - Defines the 'Friend' and 'Invite' models, which both include an 'accepted' boolean value, initially defaulted to False
* styles.css - Manages 'fade-in' animation to load pages smoothly, and defines responsive styling for mobile view

# Minesweeper

You don't need a server to play this game. Just DnD the `index.html` file into your browser.

This is a little fun example that shows how to seperate concernes. This game is build uppon the MVC concept. It's meant to be as small as possible although readable and maintainable.
There is a service that provides the model, a controller that just manipulates the model (or state of the game) and the view, that has it's on state model for its UI components.

The view only sets up the event listeners and the view and has access to the service's ```createBoard()``` to build the game and ```checkItem()``` from the controller to check the currently clicked item and ```getItems()``` for extractiing items from the model with a certain property.

The event listeners are based on event delegation.

The controller and the service could be taken as is and being implemented in a CircularJS, Vue, Ember, React or Angular example. They are not dependend on this implementation at all.

Have fun =)

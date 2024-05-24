class User {
    constructor(email, firstname, lastname, password, birthdate) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.password = password;
        this.birthdate = new Date(birthdate);
    }

    isValid() {
        return this.isValidEmail() &&
               this.firstname &&
               this.lastname &&
               this.isValidPassword() &&
               this.isValidAge();
    }

    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    isValidPassword() {
        const password = this.password;
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        return password.length >= 8 && password.length <= 40 && hasLowercase && hasUppercase && hasDigit;
    }

    isValidAge() {
        const today = new Date();
        const age = today.getFullYear() - this.birthdate.getFullYear();
        const monthDifference = today.getMonth() - this.birthdate.getMonth();
        const dayDifference = today.getDate() - this.birthdate.getDate();
        return age > 13 || (age === 13 && monthDifference >= 0 && dayDifference >= 0);
    }
}

class ToDoItem {
    constructor(name, content) {
        this.name = name;
        this.content = content;
        this.creationDate = new Date();
    }
}

class EmailSenderService {
    sendEmail(toAddress, message) {
        console.log(`Sending email to ${toAddress}: ${message}`);
    }
}

class ToDoList {
    constructor(user) {
        this.user = user;
        this.items = [];
        this.emailSender = new EmailSenderService();
    }

    canAddItem() {
        if (this.items.length >= 10) { //pas plus de 10 items par todolist
            return false;
        }
        if (this.items.length > 0) { // interdiction d'ajouter un item si on a ajouté un item à cette todolist il y a moins de 30min 
            const lastItemDate = this.items[this.items.length - 1].creationDate;
            const now = new Date();
            if (now - lastItemDate < 30 * 60 * 1000) return false;
        }
        return true;
    }

    addItem(item) {
        if (this.user.isValid() && this.canAddItem() && this.isUniqueItemName(item.name)) {
            this.items.push(item);
            //on envoie un email à l'utilisateur si sa todolist atteint les 8 items
            if (this.items.length === 8) {
                this.emailSender.sendEmail(this.user.email, "Votre Todolist est presque remplie.");
            }
            this.save(item);  // Appeler la méthode save
            return true;
        }
        return false;
    }

    isUniqueItemName(name) {
        for (const item of this.items) {
            if (item.name === name) {
                return false;
            }
        }
        return true;
    }
    

    save(item) {
        // Cette méthode sera mockée pour lever une exception
        throw new Error("Save method not implemented");
    }
}

// Tests
function runTests() {
    // Test User validation
    console.log('Running User validation tests...');
    let user = new User("example@example.com", "John", "Doe", "Password123", "2000-01-01");
    console.assert(user.isValid(), "User with valid details should be valid");

    user = new User("invalid-email", "John", "Doe", "Password123", "2000-01-01");
    console.assert(!user.isValid(), "User with invalid email should not be valid");

    user = new User("example@example.com", "John", "Doe", "password", "2000-01-01");
    console.assert(!user.isValid(), "User with invalid password should not be valid");

    user = new User("example@example.com", "John", "Doe", "Password123", "2015-01-01");
    console.assert(!user.isValid(), "User under 13 years old should not be valid");

    // Test ToDoList functionality
    console.log('Running ToDoList tests...');
    user = new User("example@example.com", "John", "Doe", "Password123", "2000-01-01");
    const todoList = new ToDoList(user);

    let item = new ToDoItem("Task1", "This is a task.");
    console.assert(todoList.addItem(item), "Should be able to add a valid item");
    console.assert(todoList.items.length === 1, "ToDoList should have 1 item");

    for (let i = 2; i <= 10; i++) {
        item = new ToDoItem(`Task${i}`, "This is a task.");
        todoList.addItem(item);
    }
    console.assert(todoList.items.length === 10, "ToDoList should have 10 items");

    item = new ToDoItem("Task11", "This is another task.");
    console.assert(!todoList.addItem(item), "Should not be able to add more than 10 items");

    todoList.items = [new ToDoItem("Task1", "This is a task.")];
    todoList.items[0].creationDate = new Date(new Date() - 29 * 60 * 1000); // 29 minutes ago
    item = new ToDoItem("Task2", "This is another task.");
    console.assert(!todoList.addItem(item), "Should not add item if less than 30 minutes have passed");

    // Test email pour le 8eme item
    console.log('Test pour l\'envoi d\'emails...');
    const emailSenderMock = {
        sendEmail: function(toAddress, message) {
            console.log(`Appel de la méthode mock sendEmail à : ${toAddress}, ${message}`);
            this.called = true;
        },
        called: false
    };

    todoList.items = [];
    todoList.emailSender = emailSenderMock;
    for (let i = 1; i <= 7; i++) {
        item = new ToDoItem(`Item ${i}`, `Un item ${i}`);
        todoList.addItem(item);
    }
    item = new ToDoItem("Item 8", "Nous sommes au 8eme item.");
    todoList.addItem(item);
    console.assert(emailSenderMock.called, "L\'email doit etre envoyé à l'ajout du 8eme item");

    // Tester la méthode save
    console.log('On teste la méthode save...');
    const todoListWithMockSave = new ToDoList(user);
    todoListWithMockSave.save = function(item) {
        throw new Error("Appel de la méthode mock de save");
    };

    try {
        item = new ToDoItem("Item 1", "Un item.");
        todoListWithMockSave.addItem(item);
    } catch (e) {
        console.assert(e.message === "La méthode mock save est appellée", "La méthode save doit renvoyer une exception");
    }
}

runTests();

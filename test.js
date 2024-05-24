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
        if (this.items.length >= 10) return false;
        if (this.items.length > 0) {
            const lastItemDate = this.items[this.items.length - 1].creationDate;
            const now = new Date();
            if (now - lastItemDate < 30 * 60 * 1000) return false;
        }
        return true;
    }

    addItem(item) {
        if (this.user.isValid() && this.canAddItem() && this.isUniqueItemName(item.name)) {
            this.items.push(item);
            if (this.items.length === 8) {
                this.emailSender.sendEmail(this.user.email, "Votre ToDoList est presque remplie.");
            }
            this.save(item);
            return true;
        }
        return false;
    }

    isUniqueItemName(name) {
        return !this.items.some(item => item.name === name);
    }

    save(item) {
        // Cette méthode sera mockée pour lever une exception
        throw new Error("Save method not implemented");
    }
}

// Tests
function runTests() {
    // Test User validation
    let user = new User("example@example.com", "John", "Doe", "Password123", "2000-01-01");
    console.assert(user.isValid(), "User with valid details should be valid");

    user = new User("invalid-email", "John", "Doe", "Password123", "2000-01-01");
    console.assert(!user.isValid(), "User with invalid email should not be valid");

    user = new User("example@example.com", "John", "Doe", "password", "2000-01-01");
    console.assert(!user.isValid(), "User with invalid password should not be valid");

    user = new User("example@example.com", "John", "Doe", "Password123", "2015-01-01");
    console.assert(!user.isValid(), "User under 13 years old should not be valid");

    // Test ToDoList functionality
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

    // Test email sending on 8th item
    const emailSenderMock = {
        sendEmail: function(toAddress, message) {
            this.called = true;
            console.log(`Mock sendEmail called with: ${toAddress}, ${message}`);
        },
        called: false
    };

    todoList.items = [];
    todoList.emailSender = emailSenderMock;
    for (let i = 1; i <= 7; i++) {
        item = new ToDoItem(`Task${i}`, "This is a task.");
        todoList.addItem(item);
    }
    item = new ToDoItem("Task8", "This is the eighth task.");
    todoList.addItem(item);
    console.assert(emailSenderMock.called, "Email should be sent when 8th item is added");

    // Test save method throwing exception
    const todoListWithMockSave = new ToDoList(user);
    todoListWithMockSave.save = function(item) {
        throw new Error("Mock save method called");
    };

    try {
        item = new ToDoItem("Task1", "This is a task.");
        todoListWithMockSave.addItem(item);
    } catch (e) {
        console.assert(e.message === "Mock save method called", "Save method should throw an exception");
    }
}

runTests();

class User {
    constructor(email, firstName, lastName, password, age) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.age = age;
    }

    isValid() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,40}$/;
        return (
            emailRegex.test(this.email) &&
            this.firstName &&
            this.lastName &&
            passwordRegex.test(this.password) &&
            this.age >= 13
        );
    }
}

class Item {
    constructor(name, content) {
        this.name = name;
        this.content = content;
        this.creationDate = new Date();
    }
}

class ToDoList {
    constructor(user) {
        if (!user.isValid()) {
            throw new Error('Invalid User');
        }
        this.user = user;
        this.items = [];
        this.lastItemCreationTime = null;
    }

    add(item) {
        const now = new Date();
        if (this.items.length >= 10) {
            throw new Error('ToDoList cannot contain more than 10 items');
        }

        if (this.lastItemCreationTime && (now - this.lastItemCreationTime) < 30 * 60 * 1000) {
            throw new Error('Items must be created at least 30 minutes apart');
        }

        if (this.items.length >= 7) {
            EmailSenderService.sendEmail(this.user.email, 'Your ToDoList is almost full');
        }

        this.items.push(item);
        this.lastItemCreationTime = now;
    }

    save() {
        throw new Error('Save method not implemented');
    }
}

class EmailSenderService {
    static sendEmail(email, message) {
        console.log(`Email sent to ${email}: ${message}`);
    }
}

class MockEmailSenderService {
    static sendEmail(email, message) {
        // Mock implementation
    }
}

class MockToDoList extends ToDoList {
    save() {
        // Mock implementation
    }
}

function runTests() {
    const assert = require('assert');

    // Test User validation
    let user = new User('test@example.com', 'John', 'Doe', 'Password1', 20);
    assert(user.isValid(), 'User should be valid');

    user = new User('invalid-email', 'John', 'Doe', 'Password1', 20);
    assert(!user.isValid(), 'User should be invalid due to email');

    user = new User('test@example.com', '', 'Doe', 'Password1', 20);
    assert(!user.isValid(), 'User should be invalid due to missing firstName');

    // Test ToDoList creation and item addition
    const validUser = new User('test@example.com', 'John', 'Doe', 'Password1', 20);
    const todoList = new ToDoList(validUser);
    const item1 = new Item('Task 1', 'Content for task 1');
    todoList.add(item1);
    assert(todoList.items.length === 1, 'ToDoList should have 1 item');

    // Mocking EmailSenderService
    ToDoList.prototype.sendEmail = MockEmailSenderService.sendEmail;

    for (let i = 2; i <= 8; i++) {
        const item = new Item(`Task ${i}`, `Content for task ${i}`);
        todoList.add(item);
    }
    assert(todoList.items.length === 8, 'ToDoList should have 8 items');

    // Mocking save method
    const mockToDoList = new MockToDoList(validUser);
    try {
        mockToDoList.save();
    } catch (e) {
        assert(e.message === 'Save method not implemented', 'Save method should throw not implemented error');
    }

    console.log('All tests passed!');
}

runTests();


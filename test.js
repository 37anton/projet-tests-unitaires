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
        console.log(`On envoie l'email à ${toAddress}: ${message}`);
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
    }
}

// Tests
function runTests() {
    // Test User validation
    console.log('Tests de validation d\'users...');
    let user = new User("test@test.com", "Testprenom", "Testnom", "Password123", "2000-01-01");
    console.assert(user.isValid(), "Les utilisateurs avec des informations correctes sont valide");

    user = new User("email-pas-valide", "Testprenom", "Testnom", "Password123", "2000-01-01");
    console.assert(user.isValid(), "Les utilisateurs avec une adresse mail pas valide ne sont pas valide");

    user = new User("test@test.com", "Testprenom", "Testnom", "password", "2000-01-01");
    console.assert(user.isValid(), "Les utilisateurs ne validant pas toutes les conditions du password ne sont pas valide");

    user = new User("test@test.com", "Yassine", "ABDELKADER", "Password123", "2020-01-01");
    console.assert(user.isValid(), "Les utilisateurs qui ont moins de 13 ans ne sont pas valide ");

    // Test ToDoList fonctionnalité
    console.log('Tests de ToDoList..');
    user = new User("test@test.com", "Testprenom", "Testnom", "Password123", "2000-01-01");
    const todoList = new ToDoList(user);

    let item = new ToDoItem("Item1", "Ceci est un item.");
    console.assert(todoList.addItem(item), "On doit pouvoir ajouter un item valide");
    console.assert(todoList.items.length === 1, "ToDoList doit avoir 1 item");

    for (let i = 2; i <= 10; i++) {
        item = new ToDoItem(`Item${i}`, "Ceci est un item.");
        todoList.addItem(item);
    }
    console.assert(todoList.items.length === 10, "ToDoList devrait avoir 10 items");

    item = new ToDoItem("Item11", "Ceci est un autre item.");
    console.assert(todoList.addItem(item), "Impossible d'ajouter plus de 10 items");

    todoList.items = [new ToDoItem("Item1", "Ceci est un item.")];
    todoList.items[0].creationDate = new Date(new Date() - 29 * 60 * 1000); // Il y a 29 minutes
    item = new ToDoItem("Item2", "Ceci est un autre item.");
    console.assert(todoList.addItem(item), "On ne peut pas ajouter d'item s'il n'y a pas 30 minutes qui se sont écoulés depuis le dernier ajout");

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
        throw new Error("La méthode mock save est appellée");
    };

    try {
        item = new ToDoItem("Item 1", "Un item.");
        todoListWithMockSave.addItem(item);
    } catch (e) {
        console.assert(e.message === "La méthode mock save est appellée", "La méthode save doit renvoyer une exception");
    }
}

runTests();

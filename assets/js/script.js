// ------------------------------- Global Variables -----------------------------------------------
var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgress = document.querySelector("#tasks-in-progress");
var tasksCompleted = document.querySelector("#tasks-completed");
var taskIdCounter = 0;

var tasks = [];
// ------------------------------------------------------------------------------------------------

var completeEditTask = function(taskName, taskType, taskId) {
   // find the matching task list item
   var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

   //set new values
   taskSelected.querySelector("h3.task-name").textContent = taskName;
   taskSelected.querySelector("span.task-type").textContent = taskType;

   for (var i=0; i < tasks.length; i++) {
       if (tasks[i].id === parseInt(taskId)) {
           tasks[i].name = taskName;
           tasks[i].type = taskType;
       }
   }

   alert("task updated!");

   saveTasks();

   formEl.removeAttribute("data-task-id");
   document.querySelector("#save-task").textContent = "Add Task";
};

var taskFormHandler = function(event) {
    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    // Check if input values are empty strings
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }

    formEl.reset();
    
    var isEdit = formEl.hasAttribute("data-task-id");

    // has data attribute, so get taskID and call function to complete edit process.
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    } 
    // no data attribute, so create object as normal and pass to createTaskEl function.
    else {
        // package data up as an object
        var taskDataObj = {
        name: taskNameInput,
        type: taskTypeInput,
        status: "to do"
        };
        var isLoaded = false;
        createTaskEl(taskDataObj, isLoaded);
    }
}

var createTaskEl = function(taskDataObj, isLoaded) {
    // create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item"; 

    // add custom attribute 
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    // create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    // give it a class name
    taskInfoEl.className = "task-info";

    //add html content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);

    // set id attribute to taskIdCounter for task data obj
    taskDataObj.id = taskIdCounter;

    // push object to tasks array
    tasks.push(taskDataObj);

    // save to local storage
    saveTasks();

    // create task actions
    var taskActionEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionEl);

    if (isLoaded) {
        if (taskDataObj.status === "to do") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.appendChild(listItemEl);
        } else if (taskDataObj.status === "in progress") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
            tasksInProgress.appendChild(listItemEl);
        } else if (taskDataObj.status === "completed") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompleted.appendChild(listItemEl);
        }
    } else {
        // add entire list item to list
        tasksToDoEl.appendChild(listItemEl);
    }
    
    // increment task counter by one
    taskIdCounter++;
}

var createTaskActions = function(taskId) {
    // create div container for buttons
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    // create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    // create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    var statusChoices = ["To Do", "In Progress", "Completed"];

    for (var i=0; i < statusChoices.length; i++) {
        // create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        // append to select
        statusSelectEl.appendChild(statusOptionEl);
    }

    actionContainerEl.appendChild(statusSelectEl);

    return actionContainerEl;
};

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    // placeholder to store updated tasks
    var updatedTaskArr = [];

    for (var i=0; i < tasks.length; i++) {
        // if tasks[i].id doesn't match the value of taskId, keep that task and push into new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }
    tasks = updatedTaskArr;
    saveTasks();
};

var editTask = function(taskId) {
    // get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;

    var taskType = taskSelected.querySelector("span.task-type").textContent;

    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;
    document.querySelector("#save-task").textContent = "Save Task";
    formEl.setAttribute("data-task-id", taskId);

};

var taskButtonHandler = function(event) {
    var targetEl = event.target;
    
    // Delete button was clicked
    if (targetEl.matches(".delete-btn")) {
        // get the element's task id
        var taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
    // Edit button was clicked
    else if (targetEl.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }
};

var taskStatusChangeHandler = function(event) {
    // get task item's id
    var taskId = event.target.getAttribute("data-task-id");

    // get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    // find the parent task item element based on the Id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']"); 
    
    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    } else if (statusValue === "in progress") {
        tasksInProgress.appendChild(taskSelected);
    } else if (statusValue === "completed") {
        tasksCompleted.appendChild(taskSelected);
    }

    for (var i=0; i < tasks.length; i++) {
        if(tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    saveTasks();
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function() {
    var isLoaded = true;
    var savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
        tasks = [];
        return false;
    }

    savedTasks = JSON.parse(savedTasks);
    for (var i=0; i < savedTasks.length; i++) {
        // pass each object into the createTaskEl() function
        createTaskEl(savedTasks[i], isLoaded);
    }
};

loadTasks();
pageContentEl.addEventListener("click", taskButtonHandler);
formEl.addEventListener("submit", taskFormHandler);
pageContentEl.addEventListener("change", taskStatusChangeHandler);

(function(){
	
	/**
	*  Task events are used by the task manager to communicate
	*  when tasks change
	*  
	*  @class cloudkid.TaskEvent
	*  @constructor
	*  @param {String} type The type of event
	*  @param {cloudkid.Task} task The task this event relates to
	*  @param {object} data description
	*/
	var TaskEvent = function(type, task, data)
	{
		this.initialize(type, task, data);
	};
	
	// Reference to the prototype
	var p = TaskEvent.prototype;
	
	/**
	 * A task is about to start
	 * @event onItemAboutToLoad
	 */
	TaskEvent.TASK_ABOUT_TO_START = "onItemAboutToLoad";
	
	/**
	 * A task is now starting
	 * event onItemLoading
	 */
	TaskEvent.TASK_STARTING = "onItemLoading";
	
	/**
	 * An task is done. The data of this event is the task's result.
	 * @event onItemLoaded
	 */
	TaskEvent.TASK_DONE = "onItemLoaded";
	
	/**
	* Task this event pertains to
	* 
	* @property {cloudkid.Task} task
	*/
	p.task = null;
	
	/**
	* The task result
	* 
	* @property {*} data
	*/
	p.data = null;
	
	/**
	* The type of event
	* 
	* @property {String} type
	*/
	p.type = null;

	/**
	*  Init the event
	*  
	*  @function initialize
	*  @param {String} type The type of event
	*  @param {cloudkid.Task} task The task attached to this event
	*  @param {*} data The data result associated with this task
	*/
	p.initialize = function(type, task, data)
	{
		this.type = type;
		this.task = task;
		this.data = data;
	};
	
	// Assign to the namespace
	namespace('cloudkid').TaskEvent = TaskEvent;
}());
(function(){
	
	/**
	*  A task is used by the Task Manager to do an 
	*  asyncronous task (like loading or playback)
	*  
	*  @class cloudkid.Task
	*  @constructor
	*  @param {String} id Alias for the task
	*  @param {function} callback Function to call when the task is completed
	*/
	var Task = function(id, callback)
	{
		this.initialize(id, callback);
	};
	
	/** Prototype reference */
	var p = Task.prototype;
	
	/**
	* The unique id of the task
	* 
	* @property {String} id
	*/
	p.id = null;
	
	/**
	* Callback to call when the task is completed
	* 
	* @property {function} callback
	*/
	p.callback = null;
	
	/**
	* Bool to keep track if this has been destroyed
	* 
	* @property {bool} _isDestroyed
	* @protected
	*/
	p._isDestroyed = false;
	
	/**
	*   Make a task but don't load
	*   @function initialize
	*   @param {String} id ID of the task
	*   @param {function} callback Callback to to call with the result, this task, and the
	*          TaskManager that started it
	*/
	p.initialize = function(id, callback)
	{
		this.id = id;
		this.callback = callback;
	};
	
	/**
	*   Called from the task manager when a Task is finished
	*   @function done
	*   @param {type} result The resulting data from the return
	*   @param {cloudkid.TaskManager} manager The reference to the manager
	*/
	p.done = function(result, manager)
	{
		if (this.callback)
		{
			this.callback(result, this, manager);
		}
	};
	
	/**
	*   Start the load. This implementation is a NOP.
	*   
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function()
	{
		Debug.assert(false, "Base implementation of Task cannot be called");
	};
	
	/**
	* Cancel the task - for use in inherited classes
	* @function cancel
	* @return {bool} If the cancel was successful
	*/
	p.cancel = function()
	{
		return true;
	};
	
	/**
	*   Get a string representation of this task
	*   
	*   @function toString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[Task ID (" + this.id + ")]";
	};
	
	/**
	*   If this task has been __isDestroyed
	*   Don't use after this
	*   
	*   @function destroy
	*/
	p.destroy = function()
	{
		if(this._isDestroyed) return;
		
		this._isDestroyed = true;
		this.callback = null;
		this.id = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').Task = Task;
	
}());
(function(){
	
	// Imports
	var Task = cloudkid.Task;
	
	/**
	*   A task to do some generic async function task
	*   
	*   @class cloudkid.FunctionTask
	*   @constructor
	*   @extends cloudkid.Task
	*   @param {String} id Alias for this task
	*   @param {function} serviceCall Function the service call
	*   @param {function} callback Function to call when the task is completed
	*   @param {*} args The arguments passed to the service call
	*   @author Matt Moore
	*/
	var FunctionTask = function(id, serviceCall, callback, args)
	{
		this.initialize(id, serviceCall, callback, args);
	};
	
	/** Reference to the inherieted task */
	var p = FunctionTask.prototype = new Task();
	
	/** Super for the constructor */
	p.Task_initialize = p.initialize;
	
	/** Super for the destroy function */
	p.Task_destroy = p.destroy;
	
	/**
	* The url of the file to load
	* 
	* @property {function} serviceCall
	*/
	p.serviceCall = null;
	
	/**
	* The media loader priorty of the load
	* @property {*} args
	*/
	p.args = null;
	
	/**
	*   Create the service task
	*   
	*   @function initialize
	*   @param {String} id The key for the task
	*   @param {function} serviceCall Function the service call
	*   @param {function} callback The function to callback when done
	*   @param {*} args The arguments passed to the service call, (callback is first)
	*/
	p.initialize = function(id, serviceCall, callback, args)
	{
		this.Task_initialize(id, callback);
		
		this.serviceCall = serviceCall;
		
		this.args = [];
		
		// Get the additional arguments as an array
		if (args)
		{
			var a = Array.prototype.slice.call(arguments);
			this.args = a.slice(3);
		}
	};
	
	/**
	*   Start the load
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		this.serviceCall.apply(null, [callback].concat(this.args));
	};
	
	/**
	* Get a string representation of this task
	* 
	* @function toString
	* @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[FunctionTask ID (" + this.id + ")]";
	};
	
	/**
	*  Destroy this load task and don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this.Task_destroy();
		
		this.serviceCall = null;
		this.args = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').FunctionTask = FunctionTask;
	
}());
(function(undefined){
	
	// Imports
	var MediaLoader = cloudkid.MediaLoader,
		Task = cloudkid.Task,
		LoaderQueueItem = cloudkid.LoaderQueueItem;
	
	/**
	*  Load task is a common type of task used for loading assets
	*  through the MediaLoader
	*  
	*  @class cloudkid.LoadTask
	*  @extends cloudkid.Task
	*  @constructor
	*  @param {String} id Alias for the task
	*  @param {String} url The url from which to load the asset
	*  @param {function} callback The function to call once loading is complete
	*  @param {function} updateCallback Optional call back to get load progress
	*  @param {int} priority Media loader priority of the load
	*  @param {*} data Opitonal loading options
	*/
	var LoadTask = function(id, url, callback, updateCallback, priority, data)
	{
		this.initialize(id, url, callback, updateCallback, priority, data);
	};
	
	/** Reference to the inherieted task */
	var p = LoadTask.prototype = new Task();
	
	/** Super for the constructor */
	p.Task_initialize = p.initialize;
	
	/** Super for the destroy function */
	p.Task_destroy = p.destroy;
	
	/**
	* The url of the file to load 
	* 
	* @property {String} url
	*/
	p.url = null;
	
	/**
	* Loading options
	* 
	* @property {*} data
	*/
	p.data = null;
	
	/**
	* The media loader priorty of the load
	* 
	* @property {int} priority
	*/
	p.priority = null;
	
	/**
	* The optional callback to get updates (to show load progress)
	* 
	* @property {function} updateCallback
	*/
	p.updateCallback = null;
	
	/**
	*  Init the laod task
	*  
	*  @function initialize
	*  @param {String} id The id of the task
	*  @param {String} url The url to load
	*  @param {function} callback The callback to call when the load is completed
	*  @param {function} updateCallback The optional callback to get updates (to show load progress)
	*  @param {int} priority The optional priority, defaults to normal
	*  @param {*} data The optional data object, for any loading options that may have been added to the preloader
	*/
	p.initialize = function(id, url, callback, updateCallback, priority, data)
	{
		this.url = url;
		this.updateCallback = updateCallback;
		this.priority = priority === undefined ? 
			LoaderQueueItem.PRIORITY_NORMAL : priority;
		
		this.data = data;

		this.Task_initialize(id, callback);
	};
	
	/**
	*   Start the load
	*   
	*   @function start
	*   @param {function} callback Callback to call when the load is done
	*/
	p.start = function(callback)
	{
		MediaLoader.instance.load(
			this.url, 
			callback,
			this.updateCallback,
			this.priority,
			this.data
		);
	};
	
	/**
	* Cancel the task - for use in inherited classes
	* 
	* @function cancel
	* @return  {bool} If the loader removed it from the queue successfully - 
	*     false means that there is a 'load finished' event inbound 
	*     for the task manager
	*/
	p.cancel = function()
	{
		return MediaLoader.instance.cancel(this.url);
	};
	
	/**
	*   Get a string representation of this task
	*   
	*   @function ToString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[LoadTask ID (" + this.id + "), URL (" + this.url + ")]";
	};
	
	/**
	*  Destroy this load task and don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this.Task_destroy();
		this.updateCallback = null;
		this.url = null;
		this.data = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').LoadTask = LoadTask;
	
}());
(function(){

	// Imports
	var TaskEvent = cloudkid.TaskEvent;

	/**
	*  The task manager is responsible for doing a series
	*  of asyncronous tasks
	*  
	*  @class cloudkid.TaskManager
	*  @constructor
	*  @param {Array} tasks The series of tasks to do
	*/
	var TaskManager = function(tasks)
	{
		this.initialize(tasks);
	};
	
	var p = TaskManager.prototype;
	
	/**
	* Adds the specified event listener
	* @function addEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener An object with a handleEvent method, or a function that will be called when the event is dispatched
	* @return {function|object} Returns the listener for chaining or assignment
	*/
	p.addEventListener = null;

	/**
	* Removes the specified event listener
	* @function removeEventListener
	* @param {String} type The string type of the event
	* @param {function|object} listener The listener function or object
	*/
	p.removeEventListener = null;

	/**
	* Removes all listeners for the specified type, or all listeners of all types
	* @function removeAllEventListeners
	* @param {String} type The string type of the event. If omitted, all listeners for all types will be removed.
	*/
	p.removeAllEventListeners = null;

	/**
	* Dispatches the specified event
	* @function dispatchEvent
	* @param {Object|String} enventObj An object with a "type" property, or a string type
	* @param {object} target The object to use as the target property of the event object
	* @return {bool} Returns true if any listener returned true
	*/
	p.dispatchEvent = null;

	/**
	* Indicates whether there is at least one listener for the specified event type
	* @function hasEventListener
	* @param {String} type The string type of the event
	* @return {bool} Returns true if there is at least one listener for the specified event
	*/
	p.hasEventListener = null;

	/**
	* Createjs EventDispatcher method
	* @property {Array} _listeners description
	* @private
	*/
	p._listeners = null;
	
	// we only use EventDispatcher if it's available:
	if (createjs.EventDispatcher) 
		createjs.EventDispatcher.initialize(p); // inject EventDispatcher methods.
	
	/**
	* The current version of the state manager
	*  
	* @property {String} VERSION
	* @static
	* @final
	*/
	TaskManager.VERSION = '${version}';
	
	/**
	* Event dispatched when tasks are all done
	* 
	* @event onAllTasksDone
	*/
	TaskManager.ALL_TASKS_DONE = "onAllTasksDone";
	
	/**
	* Collection of all tasks
	* 
	* @property {Array} tasks
	*/
	p.tasks = null;
	
	/**
	* The current tasks
	* 
	* @property {Array} _currentTaskes
	* @private
	*/
	p._currentTasks = null;
	
	/**
	* If we're paused and should therefore not automatically proceed to the
	* next task after each task completes
	* 
	* @property {bool} paused
	*/
	p.paused = true;
	
	/**
	* The number of tasks that are currently in progress
	* 
	* @property {int} _tasksInProgress
	* @private
	*/
	p._tasksInProgress = 0;
	
	/**
	* If the manager is destroyed
	* 
	* @property {bool} _isDestroyed
	* @private
	*/
	p._isDestroyed = false;
	
	/**
	*  Convenience method to execute tasks without having to setup the event listener
	* 
	*  @method process
	*  @static
	*  @param {Array} tasks The collection of tasks
	*  @param {Function} callback The callback
	*  @param {Boolean} [startAll=true] If we should start all tasks
	*  @param {Boolean} [immediateDestroy=true] Destroy after load
	*  @return {TaskManager} The instance of the task manager created
	*/
	TaskManager.process = function(tasks, callback, startAll, immediateDestroy)
	{
		immediateDestroy = immediateDestroy || true;
		startAll = startAll || true;

		var allDone = TaskManager.ALL_TASKS_DONE;
		var manager = new TaskManager(tasks);
		manager.addEventListener(
			allDone,
			function()
			{
				// Remove the listener
				manager.removeEventListener(allDone);

				// Destroy the manager
				if (immediateDestroy) manager.destroy();

				// Callback
				if (callback !== null) callback();
			}
		);

		// Decide if we should start all tasks or just the next one
		if (startAll)
			manager.startAll();
		else 
			manager.startNext();

		return manager;
	};

	/**
	*  Initializes the task manager
	*  
	*  @function initialize
	*  @param {Array} tasks The optional array of tasks, we can also add this later
	*/
	p.initialize = function(tasks)
	{
		this._currentTasks = [];
		this.tasks = tasks || [];
	};
	
	/**
	*  Convenience function to add a task
	*  
	*  @function addTask
	*  @param {cloudkid.Task} task The task object to load
	*/
	p.addTask = function(task)
	{
		this.tasks.push(task);
	};
	
	/**
	*  Add bunch of tasks
	*  
	*  @function addTasks
	*  @param {Array} tasks Collection of tasks to add
	*
	*/
	p.addTasks = function(tasks)
	{
		this.removeAll();
		this.tasks = tasks;
	};
	
	/**
	*   Cancel and remove all tasks
	*   
	*   @function removeAll
	*/
	p.removeAll = function()
	{
		this._tasksInProgress = 0;
		this.paused = true;
		var task, i;
		if (this._currentTasks && this._currentTasks.length > 0)
		{
			for (i = 0; i < this._currentTasks.length; i++)
			{
				task = this._currentTasks[i];
				if (task.cancel()) task.destroy();
			}
		}
		if (this.tasks && this.tasks.length > 0)
		{
			for (i = 0; i < this.tasks.length; i++)
			{
				task = this.tasks[i];
				task.destroy();
			}
		}
		this._currentTasks.length = 0;
		this.tasks.length = 0;
	};
	
	/**
	*	Cancels all tasks with a given id
	*	@function cancelTask
	*	@param {String} taskId The task id to remove.
	*/
	p.cancelTask = function(taskId)
	{
		var i;
		for(i = 0; i < this._currentTasks.length; ++i)
		{
			if(this._currentTasks[i].id == taskId)
			{
				if(this._currentTasks[i].cancel())
				{
					this._currentTasks[i].destroy();
					this._currentTasks.splice(i, 1);
					--this._tasksInProgress;
					--i;
				}
			}
		}
		for(i = 0; i < this.tasks.length; ++i)
		{
			if(this.tasks[i].id == taskId)
			{
				this.tasks[i].destroy();
				this.tasks.splice(i, 1);
				--i;
			}
		}
	};
	
	/**
	*   Start the next task in the tasks list. When it is done, the
	*   task's callback will be called.  If the manager is not paused after
	*   the task's callback returns, the manager will start the next task.
	*   @function startNext
	*   @return {cloudkid.Task} The task that was started or null if the list contained no
	*           tasks to be processed
	*/
	p.startNext = function()
	{
		if (this._isDestroyed) return;
		
		Debug.assert(!!this.tasks, "startNext(): There are no task for this Task Manager");
		
		var task;
		while (this.tasks.length > 0 && !(task = this.tasks.shift()))
		{
		}
		if (!task)
		{
			return null;
		}
		
		this._currentTasks.push(task);
		
		this.paused = false;
		
		// Give warning that a task is about to be started and respect pauses
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_ABOUT_TO_START, task));
	
		if (this.paused)
		{
			return null;
		}
		
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_STARTING, task));
		this._tasksInProgress++;
		
		task.start(this.onTaskDone.bind(this, task));
		
		return task;
	};
	
	/**
	*   Callback for when an task is done
	*   
	*   @function onTaskDone
	*   @param {*} result Result of the task
	*   @param {cloudkid.Task} task Task that is done
	*/
	p.onTaskDone = function(task, result)
	{
		if (this._isDestroyed) return;
		
		this._tasksInProgress--;
		
		this.dispatchEvent(new TaskEvent(TaskEvent.TASK_DONE, task, result));
		task.done(result, this);
		
		// Remove from the current tasks
		// and destroy
		var index = this._currentTasks.indexOf(task);
		if (index > -1)
		{
			this._currentTasks.splice(index, 1);
		}
		task.destroy();		
		
		// No more valid tasks
		if (this._tasksInProgress === 0 && this.tasks.length === 0)
		{
			this.dispatchEvent(new TaskEvent(TaskManager.ALL_TASKS_DONE, null));
		}
		else
		{
			if (!this.paused)
			{
				this.startNext();
			}
		}
	};
	
	/**
	*   Start the next task until there are no more tasks to start
	*   @function startAll
	*   @return {Array} All tasks that were started
	*/
	p.startAll = function()
	{
		Debug.assert(!!this.tasks, "startAll(): There are no task for this Task Manager");
		
		var ret = [];
		
		while (true)
		{
			var task = this.startNext();
			if (!task)
			{
				break;
			}
			ret.push(task);
		}
		return ret;
	};
	
	/**
	*   We don't want to use the task manager after this
	*   @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this._isDestroyed = true;
		
		this.removeAll();
		this._currentTasks = null;
		this.tasks = null;
	};

	namespace('cloudkid').TaskManager = TaskManager;
}());
(function(){
	
	// Imports
	var Task = cloudkid.Task,
		LoadTask = cloudkid.LoadTask,
		TaskEvent = cloudkid.TaskEvent,
		TaskManager = cloudkid.TaskManager;
	
	/**
	*   A task that performs a list of tasks
	*   
	*   @class cloudkid.ListTask
	*   @extends cloudkid.Task
	*   @constructor
	*   @param {String} id Alias for this ListTask
	*   @param {Array} list The list of tasks
	*   @param {function} callback Function to call when the task is completed
	*/
	var ListTask = function(id, list, callback)
	{
		this.initialize(id, list, callback);
	};
	
	// Reference to the Task prototype
	var p = ListTask.prototype = new Task();
	
	/** Super for the constructor */
	p.Task_initialize = p.initialize;
	
	/** Super for the destroy function */
	p.Task_destroy = p.destroy;

	/**
	* The list of other tasks, as an array
	* 
	* @property {Array} list
	*/
	p.list = null;
	
	/**
	* The internal task manager
	* 
	* @property {cloudkid.TaskManager} _manager
	* @private
	*/
	p._manager = null;
	
	/**
	* The load results dictionary
	* 
	* @property {Dictionary} _results
	* @private
	*/
	p._results = null;
	
	/**
	*   Make the list task but don't start.
	*   @function initialize
	*   @param {String} id ID of the task
	*   @param {Array} list List of tasks to start or a preloadJS manifest.
	*   @param {function} callback Callback to to call with the result of the tasks, this
	*          task, and the TaskManager that loaded it
	*/
	p.initialize = function(id, list, callback)
	{
		this.Task_initialize(id, callback);
		
		var tasks = [];
		for(var i = 0; i < list.length; i++)
		{
			// remove null items
			if (!list[i])
			{
				continue;
			}
			// If it's a task just add it to the list
			else if (list[i] instanceof Task)
			{
				tasks.push(list[i]);
			}
			// Check for manifest item
			else if (list[i].id && list[i].src)
			{
				tasks.push(new LoadTask(
					list[i].id, 
					list[i].src, 
					list[i].callback, 
					list[i].updateCallback,
					list[i].priority,
					list[i].data
				));
			}
		}
		this.list = tasks;
	};
	
	/**
	*   Start the load
	*   @function load
	*   @param {function} callback Callback to call when the task is done
	*/
	p.start = function(callback)
	{
		this._results = {};
		this._manager = new TaskManager(this.list.slice());
		this._manager.addEventListener(
			TaskEvent.TASK_DONE, 
			this._onTaskDone.bind(this)
		);
		this._manager.addEventListener(
			TaskManager.ALL_TASKS_DONE, 
			this._onAllTasksComplete.bind(this, callback)
		);
		this._manager.startAll();
	};
	
	/**
	*   Callback for when an task is done
	*   @function _onTaskDone
	*   @param {cloudkid.TaskEvent} ev Task Loaded event
	*   @private
	*/
	p._onTaskDone = function(ev)
	{
		if (this._isDestroyed) return;
		
		this._results[ev.task.id] = ev.data;
	};
	
	/**
	*   Callback for when the whole list is done
	*   
	*   @function _onAllTasksComplete
	*   @param {function} callback Callback passed to start()
	*   @private
	*/
	p._onAllTasksComplete = function(callback)
	{
		if (this._isDestroyed) return;
		callback(this._results);
	};
	
	/**
	*  Cancel the TaskManager used for the list of tasks. As the individual tasks are not 
	*  kept track of, this always returns true.
	*  @function cancel
	*  @return Returns true.
	*/
	p.cancel = function()
	{
		this._manager.removeAll();
		return true;
	};
	
	/**
	*   Get a string representation of this task
	*   @function toString
	*   @return {String} A string representation of this task
	*/
	p.toString = function()
	{
		return "[ListTask ID (" + this.id + "), tasks (" + this.list + ")]";
	};
	
	/**
	*  Don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;
		
		this.Task_destroy();
		
		this._results = null;
		
		for(var i = 0; i < this.list.length; i++)
		{
			this.list[i].destroy();
		}
		if (this._manager)
		{
			this._manager.destroy();
			this._manager = null;
		}
		this.list = null;
	};
	
	// Assign to the name space
	namespace('cloudkid').ListTask = ListTask;
	
}());

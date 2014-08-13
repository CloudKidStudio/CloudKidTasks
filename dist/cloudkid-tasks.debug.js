!function() {
    var TaskEvent = function(type, task, data) {
        this.initialize(type, task, data);
    }, p = TaskEvent.prototype;
    TaskEvent.TASK_ABOUT_TO_START = "onItemAboutToLoad", TaskEvent.TASK_STARTING = "onItemLoading", 
    TaskEvent.TASK_DONE = "onItemLoaded", p.task = null, p.data = null, p.type = null, 
    p.initialize = function(type, task, data) {
        this.type = type, this.task = task, this.data = data;
    }, namespace("cloudkid").TaskEvent = TaskEvent;
}(), function() {
    var Task = function(id, callback) {
        this.initialize(id, callback);
    }, p = Task.prototype;
    p.id = null, p.callback = null, p._isDestroyed = !1, p.initialize = function(id, callback) {
        this.id = id, this.callback = callback;
    }, p.done = function(result, manager) {
        this.callback && this.callback(result, this, manager);
    }, p.start = function() {
        Debug.assert(!1, "Base implementation of Task cannot be called");
    }, p.cancel = function() {
        return !0;
    }, p.toString = function() {
        return "[Task ID (" + this.id + ")]";
    }, p.destroy = function() {
        this._isDestroyed || (this._isDestroyed = !0, this.callback = null, this.id = null);
    }, namespace("cloudkid").Task = Task;
}(), function() {
    var Task = cloudkid.Task, FunctionTask = function(id, serviceCall, callback, args) {
        this.initialize(id, serviceCall, callback, args);
    }, p = FunctionTask.prototype = new Task();
    p.Task_initialize = p.initialize, p.Task_destroy = p.destroy, p.serviceCall = null, 
    p.args = null, p.initialize = function(id, serviceCall, callback, args) {
        if (this.Task_initialize(id, callback), this.serviceCall = serviceCall, this.args = [], 
        args) {
            var a = Array.prototype.slice.call(arguments);
            this.args = a.slice(3);
        }
    }, p.start = function(callback) {
        this.serviceCall.apply(null, [ callback ].concat(this.args));
    }, p.toString = function() {
        return "[FunctionTask ID (" + this.id + ")]";
    }, p.destroy = function() {
        this._isDestroyed || (this.Task_destroy(), this.serviceCall = null, this.args = null);
    }, namespace("cloudkid").FunctionTask = FunctionTask;
}(), function(undefined) {
    var MediaLoader = cloudkid.MediaLoader, Task = cloudkid.Task, LoaderQueueItem = cloudkid.LoaderQueueItem, LoadTask = function(id, url, callback, updateCallback, priority, data) {
        this.initialize(id, url, callback, updateCallback, priority, data);
    }, p = LoadTask.prototype = new Task();
    p.Task_initialize = p.initialize, p.Task_destroy = p.destroy, p.url = null, p.data = null, 
    p.priority = null, p.updateCallback = null, p.initialize = function(id, url, callback, updateCallback, priority, data) {
        this.url = url, this.updateCallback = updateCallback, this.priority = priority === undefined ? LoaderQueueItem.PRIORITY_NORMAL : priority, 
        this.data = data, this.Task_initialize(id, callback);
    }, p.start = function(callback) {
        MediaLoader.instance.load(this.url, callback, this.updateCallback, this.priority, this.data);
    }, p.cancel = function() {
        return MediaLoader.instance.cancel(this.url);
    }, p.toString = function() {
        return "[LoadTask ID (" + this.id + "), URL (" + this.url + ")]";
    }, p.destroy = function() {
        this._isDestroyed || (this.Task_destroy(), this.updateCallback = null, this.url = null, 
        this.data = null);
    }, namespace("cloudkid").LoadTask = LoadTask;
}(), function() {
    var TaskEvent = cloudkid.TaskEvent, TaskManager = function(tasks) {
        this.initialize(tasks);
    }, p = TaskManager.prototype;
    p.addEventListener = null, p.removeEventListener = null, p.removeAllEventListeners = null, 
    p.dispatchEvent = null, p.hasEventListener = null, p._listeners = null, createjs.EventDispatcher && createjs.EventDispatcher.initialize(p), 
    TaskManager.VERSION = "1.0.0", TaskManager.ALL_TASKS_DONE = "onAllTasksDone", 
    p.tasks = null, p._currentTasks = null, p.paused = !0, p._tasksInProgress = 0, p._isDestroyed = !1, 
    TaskManager.process = function(tasks, callback, startAll, immediateDestroy) {
        immediateDestroy = immediateDestroy || !0, startAll = startAll || !0;
        var allDone = TaskManager.ALL_TASKS_DONE, manager = new TaskManager(tasks);
        return manager.addEventListener(allDone, function() {
            manager.removeEventListener(allDone), immediateDestroy && manager.destroy(), null !== callback && callback();
        }), startAll ? manager.startAll() : manager.startNext(), manager;
    }, p.initialize = function(tasks) {
        this._currentTasks = [], this.tasks = tasks || [];
    }, p.addTask = function(task) {
        this.tasks.push(task);
    }, p.addTasks = function(tasks) {
        this.removeAll(), this.tasks = tasks;
    }, p.removeAll = function() {
        this._tasksInProgress = 0, this.paused = !0;
        var task, i;
        if (this._currentTasks && this._currentTasks.length > 0) for (i = 0; i < this._currentTasks.length; i++) task = this._currentTasks[i], 
        task.cancel() && task.destroy();
        if (this.tasks && this.tasks.length > 0) for (i = 0; i < this.tasks.length; i++) task = this.tasks[i], 
        task.destroy();
        this._currentTasks.length = 0, this.tasks.length = 0;
    }, p.cancelTask = function(taskId) {
        var i;
        for (i = 0; i < this._currentTasks.length; ++i) this._currentTasks[i].id == taskId && this._currentTasks[i].cancel() && (this._currentTasks[i].destroy(), 
        this._currentTasks.splice(i, 1), --this._tasksInProgress, --i);
        for (i = 0; i < this.tasks.length; ++i) this.tasks[i].id == taskId && (this.tasks[i].destroy(), 
        this.tasks.splice(i, 1), --i);
    }, p.startNext = function() {
        if (!this._isDestroyed) {
            Debug.assert(!!this.tasks, "startNext(): There are no task for this Task Manager");
            for (var task; this.tasks.length > 0 && !(task = this.tasks.shift()); ) ;
            return task ? (this._currentTasks.push(task), this.paused = !1, this.dispatchEvent(new TaskEvent(TaskEvent.TASK_ABOUT_TO_START, task)), 
            this.paused ? null : (this.dispatchEvent(new TaskEvent(TaskEvent.TASK_STARTING, task)), 
            this._tasksInProgress++, task.start(this.onTaskDone.bind(this, task)), task)) : null;
        }
    }, p.onTaskDone = function(task, result) {
        if (!this._isDestroyed) {
            this._tasksInProgress--, this.dispatchEvent(new TaskEvent(TaskEvent.TASK_DONE, task, result)), 
            task.done(result, this);
            var index = this._currentTasks.indexOf(task);
            index > -1 && this._currentTasks.splice(index, 1), task.destroy(), 0 === this._tasksInProgress && 0 === this.tasks.length ? this.dispatchEvent(new TaskEvent(TaskManager.ALL_TASKS_DONE, null)) : this.paused || this.startNext();
        }
    }, p.startAll = function() {
        Debug.assert(!!this.tasks, "startAll(): There are no task for this Task Manager");
        for (var ret = []; ;) {
            var task = this.startNext();
            if (!task) break;
            ret.push(task);
        }
        return ret;
    }, p.destroy = function() {
        this._isDestroyed || (this._isDestroyed = !0, this.removeAll(), this._currentTasks = null, 
        this.tasks = null);
    }, namespace("cloudkid").TaskManager = TaskManager;
}(), function() {
    var Task = cloudkid.Task, LoadTask = cloudkid.LoadTask, TaskEvent = cloudkid.TaskEvent, TaskManager = cloudkid.TaskManager, ListTask = function(id, list, callback) {
        this.initialize(id, list, callback);
    }, p = ListTask.prototype = new Task();
    p.Task_initialize = p.initialize, p.Task_destroy = p.destroy, p.list = null, p._manager = null, 
    p._results = null, p.initialize = function(id, list, callback) {
        this.Task_initialize(id, callback);
        for (var tasks = [], i = 0; i < list.length; i++) list[i] && (list[i] instanceof Task ? tasks.push(list[i]) : list[i].id && list[i].src && tasks.push(new LoadTask(list[i].id, list[i].src, list[i].callback, list[i].updateCallback, list[i].priority, list[i].data)));
        this.list = tasks;
    }, p.start = function(callback) {
        this._results = {}, this._manager = new TaskManager(this.list.slice()), this._manager.addEventListener(TaskEvent.TASK_DONE, this._onTaskDone.bind(this)), 
        this._manager.addEventListener(TaskManager.ALL_TASKS_DONE, this._onAllTasksComplete.bind(this, callback)), 
        this._manager.startAll();
    }, p._onTaskDone = function(ev) {
        this._isDestroyed || (this._results[ev.task.id] = ev.data);
    }, p._onAllTasksComplete = function(callback) {
        this._isDestroyed || callback(this._results);
    }, p.cancel = function() {
        return this._manager.removeAll(), !0;
    }, p.toString = function() {
        return "[ListTask ID (" + this.id + "), tasks (" + this.list + ")]";
    }, p.destroy = function() {
        if (!this._isDestroyed) {
            this.Task_destroy(), this._results = null;
            for (var i = 0; i < this.list.length; i++) this.list[i].destroy();
            this._manager && (this._manager.destroy(), this._manager = null), this.list = null;
        }
    }, namespace("cloudkid").ListTask = ListTask;
}(), function() {
    var PixiTask = function(id, urls, callback, updateCallback, generateCanvasTexture) {
        this.initialize(id, urls, callback, updateCallback, generateCanvasTexture);
    }, p = PixiTask.prototype = new cloudkid.Task();
    p.Task_initialize = p.initialize, p.Task_destroy = p.destroy, p.urls = null, p.updateCallback = null, 
    p.generateCanvas = !1, p._assetLoader = null, p.initialize = function(id, urls, callback, updateCallback, generateCanvasTexture) {
        for (var cm = cloudkid.MediaLoader.instance.cacheManager, i = 0; i < urls.length; ++i) urls[i] = cm.prepare(urls[i]);
        this.urls = urls, this.updateCallback = updateCallback, this.generateCanvas = generateCanvasTexture || !1, 
        this.Task_initialize(id, callback);
    }, p.start = function(callback) {
        var opts = cloudkid.Application.instance.options;
        this._assetLoader = new PIXI.AssetLoader(this.urls, opts.crossOrigin, this.generateCanvas, opts.basePath), 
        this._assetLoader.onComplete = callback, this.updateCallback && (this._assetLoader.onProgress = this.onProgress.bind(this)), 
        this._assetLoader.load();
    }, p.onProgress = function() {
        this.updateCallback();
    }, p.cancel = function() {
        return this._assetLoader.onComplete = null, this._assetLoader.onProgress = null, 
        !0;
    }, p.toString = function() {
        return "[PixiTask ID (" + this.id + "), URLs (" + this.urls.join(", ") + ")]";
    }, p.destroy = function() {
        this._isDestroyed || (this.Task_destroy(), this.updateCallback = null, this.urls = null, 
        this._assetLoader && (this._assetLoader.onComplete = null, this._assetLoader.onProgress = null), 
        this._assetLoader = null);
    }, namespace("cloudkid").PixiTask = PixiTask;
}();
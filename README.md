CloudKidTasks
=============

Asynchronous task manager for CloudKidOS. While the task manager is great for preloading assets, it can also be used for media playback or any asyncronous action.

##Usage##

The easy way to use the task manager is to create a bunch of tasks and run the `process` method. This will start all tasks as once.

```js
var tasks = [
  new LoadTask('config', 'assets/config.json', onConfigLoaded),
  new LoadTask('captions', 'assets/captions.json', onCaptionsLoaded)
];

cloudkid.TaskManager.process(tasks, function(){
  // All tasks completed
});
```

##Documentation##

The API documentation can be [found here](http://cloudkidstudio.github.io/CloudKidTasks). These docs are auto-generated using [YUIDoc](http://yui.github.io/yuidoc/). To rebuild, use the ant task `ant docs`.

##Installation##

CloudKid Tasks can be install using Bower.

```bash
bower install cloudkid-tasks
```

##License##

Copyright (c) 2014 [CloudKid](http://github.com/cloudkidstudio)

Released under the MIT License.

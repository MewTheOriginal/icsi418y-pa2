# icsi418y-pa2

## Signup and Login

Signup requires a **username**, **password**, and a **first** and **last name**.

Login requires a **username** and **password**.

Missing any fields will cause the site to mention what is missing.

If there is a duplicate user when signing up, it will reject signup.

If the info for login is not in the database, it will reject login.

## Projects

Creating a project needs a **project name**, **description**, **status** (which is a dropdown), and a **project lead** (which is an existing user).

When trying to create a project, none will show up but pressing **Refresh Projects** will display it all.

You can then view members in the list and decide to add any.

When viewing members, you can also remove them as long as it is not the project lead or if they are in a story.

## User Stories

To select a project to create a story in, you can click on View Members of that project.

Creating a story needs a **title**, **description**, and **priority** (High, Medium, or Low).

New stories start with status **To Do**. You can later change the status to In Progress or Done.

You can edit a story’s title, description, priority, status, and assigned member. Blank fields are left unchanged.

You can delete a story after confirming. Canceling the confirmation leaves it unchanged.
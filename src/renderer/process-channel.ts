import { ipcRenderer } from "electron";
import { Events } from "../configs";
import {
  createAppHTMLElement,
  initDisplayApps,
  addCategory
} from "./main-page";
import { AppListConfig, App } from "../common";

let container = document.querySelector(".container");

ipcRenderer.on(Events.ADD_APP_REPLY, (_e: Event, app: App) => {
  container!.appendChild(createAppHTMLElement(app));
});

ipcRenderer.on(Events.GET_APPS_REPLY, (_e: Event, apps: AppListConfig) => {
  initDisplayApps(apps, container as HTMLElement);
});

ipcRenderer.on(
  Events.GET_CATEGORIES_REPLY,
  (_e: Event, categoryData: string[]) => {
    for (let categoryName of categoryData) {
      addCategory(categoryName);
    }
  }
);

export {};
import { ipcRenderer } from "electron";
import { App, AppListConfig } from "../common";
import { exec } from "child_process";
import { Events } from "../configs";
import "./process-channel";

export const unHoverCategoryClassName = "un-hover-category";

type ModalOkAction = "add" | "remove";

/** TODO: 换成 jq */
let modalTitle = document.querySelector(".modal-header");
let modalOkAction: ModalOkAction = "add";

export let categories = document.querySelector(".categories");
export let categoryNameInput = document.querySelector(
  "#category-name"
) as HTMLInputElement;

$(".ui.dropdown").dropdown({
  clearable: true
});

function hiddenModal() {
  $(".ui.modal").modal("hide");
}

function showModal() {
  $(".ui.modal").modal("show");
}

function setTitle(title: string) {
  modalTitle!.textContent = title;
}

function clearInputContent() {
  categoryNameInput.value = "";
}

export function traverseCategories(cb: (ele: Element) => void) {
  let categories = document.querySelectorAll(".category");

  categories.forEach(ele => cb(ele));
}

export function createCategoryNode(content: string): Node | undefined {
  if (content === "") {
    alert("分组名称不能为空");
  }

  let isCreate = true;

  traverseCategories(
    ele =>
      ele.textContent === content &&
      ((isCreate = false) || alert("已有相同的分组"))
  );

  if (!isCreate) {
    return;
  }

  let category = document
    .querySelector(".main-category")!
    .cloneNode(true) as HTMLDivElement;

  category.textContent = content;
  category.classList.remove("main-category");
  category.classList.add(unHoverCategoryClassName);

  return category;
}

export function createAppHTMLElement({
  name,
  icon: iconPath,
  path
}: App): HTMLDivElement {
  let createEle = (eleName: string, className?: string) => {
    let ele = document.createElement(eleName);

    className && (ele.className = className);
    return ele;
  };

  let app = createEle("div", "app");
  let iconDiv = createEle("div", "icon");
  let icon = createEle("img");
  let appName = createEle("p", "app-name");

  appName.innerHTML = name;
  icon.setAttribute("src", iconPath);

  iconDiv.appendChild(icon);
  app.appendChild(iconDiv);
  app.appendChild(appName);

  app.onclick = _e => {
    exec(`open ${path}`);
  };

  return app as HTMLDivElement;
}

export function initDisplayApps(apps: AppListConfig, container: HTMLElement) {
  container = container;

  for (let key of Object.keys(apps)) {
    let app = apps[key];

    container.appendChild(createAppHTMLElement(app));
  }
}

export function handleDragOver(e: Event) {
  e.preventDefault();
}

export async function handleAreaDrop(e: Event) {
  e.preventDefault();

  let file = (e as DragEvent).dataTransfer!.files[0];

  ipcRenderer.send(Events.ADD_APP, file.path);
}

export function handlePageLoaded() {
  ipcRenderer.send(Events.GET_APPS);
  ipcRenderer.send(Events.GET_CATEGORIES);
}

export function handleCategoryClick(e: Event) {
  let targetEle = e.target as HTMLDivElement;

  traverseCategories(ele => {
    if (targetEle === ele) {
      targetEle.classList.remove(unHoverCategoryClassName);
    } else {
      ele.classList.add(unHoverCategoryClassName);
    }
  });
}

export function handleAddCategoryClick() {
  modalOkAction = "add";
  clearInputContent();
  setTitle("添加分组");
  showModal();
}

export function addCategory(categoryName: string | undefined) {
  let ele = createCategoryNode(categoryName || "");

  if (ele === undefined) {
    return;
  }

  categories!.appendChild(ele);
}

export function removeCategory(categoryName: string) {
  let isExist: boolean | undefined;

  traverseCategories(ele => {
    if (ele.textContent === categoryName) {
      isExist = true;
      categories!.removeChild(ele);
    }
  });

  if (!isExist) {
    alert("要删除的分组不存在");
  }
}

export function handleAddCategoryOkClick() {
  let categoryName = categoryNameInput.value;

  if (categoryName === "主页") {
    alert("不能对主页进行操作");
  }

  if (modalOkAction === "add") {
    addCategory(categoryName);
    ipcRenderer.send(Events.ADD_CATEGORY, categoryName);
  } else {
    removeCategory(categoryName);
    ipcRenderer.send(Events.REMOVE_CATEGORY, categoryName);
  }
  hiddenModal();
}

export function handleAddCategoryCancelClick() {
  hiddenModal();
}

export function handleRemoveCategoryClick() {
  modalOkAction = "remove";
  clearInputContent();
  setTitle("删除分组");
  showModal();
}

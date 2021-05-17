import React from "react";

export interface Page {
    pathName:string,
    path:string,
    component:React.Component | any,
    isMenu:boolean
}
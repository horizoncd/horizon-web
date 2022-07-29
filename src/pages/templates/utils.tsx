import type {API} from "@/services/typings"

export const hasPermission = (currentUser: API.CurrentUser, currentPermission: boolean): boolean => {
    return currentUser.isAdmin ? true : currentPermission
}
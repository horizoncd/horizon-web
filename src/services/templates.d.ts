declare namespace Templates {
    type Template = {
    	id: number
        name: string
        chartName: string
        description?: string
        repository: string
        inGroup:     number
        createdBy: number
        updatedBy: number
        releases:    Release[]
    }

    type Release = {
        id: number
        name:       string
        description: string
        recommended: boolean
        createdBy?: number
        updatedBy?: number
    }


    type CreateTemplateRequest  = {
        name:     string
        release:    CreateReleaseRequest
        description?: string
        repository:  string
        token:       string
    }

    type CreateReleaseRequest = {
        repoTag:     string
        isRecommend:  bool
        description?: string
    }
    
    type UpdateTemplateRequest = {
        description: string
        repository: string
        token: string
    }

    type UpdateReleaseRequest = {
        isRecommend: bool  
        description: string 
    }
}
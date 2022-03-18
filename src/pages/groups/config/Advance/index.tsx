import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import  Delete from "@/pages/groups/config/Delete"
import  Transfer from "@/pages/groups/config/Transfer"

export default () => {

  return (
    <PageWithBreadcrumb>
      <Transfer/>
      <Delete/>
    </PageWithBreadcrumb>
  )
}

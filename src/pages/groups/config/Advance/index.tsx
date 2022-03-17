import Transfer from '@/pages/groups/config/Transfer'
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import  Delete from "@/pages/groups/config/Delete"

export default () => {

  return (
    <PageWithBreadcrumb>
      <Transfer/>
      <Delete/>
    </PageWithBreadcrumb>
  )
}

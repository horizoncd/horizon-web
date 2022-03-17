import Transfer from '@/pages/applications/config/Transfer'
import DefaultRegions from '@/pages/applications/config/DefaultRegions'
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'

export default () => {

  return (
    <PageWithBreadcrumb>
      <Transfer/>
      <p></p>
      <p></p>
      <DefaultRegions/>
    </PageWithBreadcrumb>
  )
}

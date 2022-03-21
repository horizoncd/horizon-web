import Transfer from '@/pages/applications/config/Transfer'
import DefaultRegions from '@/pages/applications/config/DefaultRegions'
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'

export default () => {

  return (
    <PageWithBreadcrumb>
      <div style={{marginBottom: 10}}>
        <Transfer/>
      </div>
      <DefaultRegions/>
    </PageWithBreadcrumb>
  )
}

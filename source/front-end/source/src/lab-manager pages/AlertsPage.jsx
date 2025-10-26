import StatusAlert from "../components/StatusAlert"
import LowStockAlert from "../components/LowStockAlert"
import Mqtt from "../researcher pages/mqtt"


export default function AlertsPage() {
  return (
   <>
   <StatusAlert/>
   {/* <LowStockAlert/> */}
   <Mqtt/>
   </>
  );
}

package sapienza.inventory.model;

import lombok.Data;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.LinkedList;

@Component
@Data
public class Report {

    private LinkedList<String> usages = new LinkedList<>() ;
    private LinkedList<String> restock = new LinkedList<>();
    private LinkedList<String> damage_requests = new LinkedList<>();
    private LinkedList<String> requests_completed = new LinkedList<>();


    public Report() {
        this.usages.add("Material Usage:\nTimestamp,Material,Quantity,Researcher\n");
        this.damage_requests.add("Equipment Damaged Requests:\nTimestamp,Material,Request Status,Researcher\n");
        this.restock.add("Restock:\nTimestamp,Material,Quantity,Lab Manager\n");
        this.requests_completed.add("Requests Completed:\nIssued by,Created_at,Processed_at,Type\n");
    }
    public Resource toCSV(
            Integer tot_used,
            Integer tot_added,
            Integer tot_completed

            ){

        StringBuffer csv = new StringBuffer();
        csv.append(String.join("\n", this.usages));
        csv.append("\nTotal materials used: "+tot_used + "\n");

        String.join("\n", this.restock);
        csv.append(String.join("\n", this.restock));
        csv.append("\nTotal materials restocked: "+tot_added + "\n");


        String.join("\n", this.requests_completed);
        csv.append(String.join("\n", this.requests_completed));
        csv.append("\nTotal requests completed: "+tot_completed + "\n");



        ByteArrayResource resource = new ByteArrayResource( csv.toString().getBytes());
        return resource;



    }
}

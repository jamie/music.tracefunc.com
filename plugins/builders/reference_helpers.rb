class Builders::ReferenceHelpers < SiteBuilder
  def build
    helper :abc_example do |label, notation|
      <<~HTML.html_safe
        <tr class="abc-example">
          <td>#{label}</td>
          <td><textarea class="abc-example-source" readonly rows="3">#{notation.strip}</textarea></td>
          <td class="abc-example-paper"></td>
        </tr>
      HTML
    end
  end
end

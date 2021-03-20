<template>
  <div class="chart-header row">
    <div class="chart-title col-9">
      <div v-html="title"></div>
      <div class="chart-subtitle" v-html="subtitle" v-if="subtitle"></div>
    </div>
    <div class="chart-header-buttons col-3">
      <button v-if="info" type="button" class="btn btn-secondary btn-info" data-container="body" data-toggle="popover" data-trigger="hover" data-html="true" data-placement="bottom" :data-content="info">
        i
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartHeader',
  props: {
    title: String,
    subtitle: String,
    info: String,
    bg: String,
    color: String
  }
}
</script>

<style scoped lang="scss">
$color_TI: #0d506b;
$color_TI_darker: darken( $color_TI, 20% );
.chart-header {
  padding: 10px 5px;
  margin: 0;
  background: #fafafa;
  .chart-title {
    font-size: 18px;
    text-align: left;
    color: $color_TI_darker;
    @media only screen and (max-width: 1400px) {
      font-size: 18px;
    }
    @media only screen and (max-width: 1250px) {
      font-size: 16px;
    }
    @media only screen and (max-width: 767px) {
      font-size: 20px;
    }
  }
  .chart-subtitle {
    font-size: 14px;
  }
  .chart-header-buttons {
    text-align: right;
    .btn-info {
      padding: 0px 10px;
      border-radius: 2px;
      font-weight: 600;
      background: $color_TI;
      border: none;
    }
  }
}
</style>

